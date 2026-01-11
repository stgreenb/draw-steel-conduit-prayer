/**
 * Draw Steel - Conduit Prayer Module
 * Refactored Version - Clean implementation with proper Draw Steel integration
 *
 * FLOW:
 * 1. Turn starts -> HeroModel._onStartTurn suppresses normal piety gain
 * 2. Dialog appears: "Will you PRAY before rolling?" (only on owning client)
 * 3. Player chooses PRAY or SKIP (before any rolling happens)
 * 4. Roll single 1d3 - result determines both baseline and prayer effects
 * 5. Apply total piety gain using Draw Steel's /gain enricher system
 */

console.log("INFO: Conduit Prayer module starting...");

// Inject custom CSS for prayer messages
const prayerCSS = `
.ds-conduit-prayer {
  border: 1px solid var(--color-border-light-2);
  padding: 8px;
  border-radius: 5px;
  margin: 4px 0;
}

.ds-conduit-prayer .header {
  flex-basis: 100%;
  text-align: center;
  font-size: var(--font-size-16);
  font-weight: bold;
  margin-bottom: 8px;
}

.ds-conduit-prayer .prayer-details {
  font-size: var(--font-size-13);
  line-height: 1.4;
}

.ds-conduit-prayer .prayer-details p {
  margin: 4px 0;
}
`;

// Add CSS to document head
const styleElement = document.createElement('style');
styleElement.innerHTML = prayerCSS;
document.head.appendChild(styleElement);

// ===== DATA ACCESSORS =====

function getConduitPiety(actor) {
  return actor.system?.hero?.primary?.value ?? 0;
}

function getConduitLevel(actor) {
  return actor.system?.details?.level ?? 1;
}

// ===== CLASS DETECTION =====

function isConduit(actor) {
  if (!actor || actor.type !== "hero") return false;
  return actor.system?.class?.system?._dsid === "conduit";
}

// ===== PRAYER HANDLERS =====

async function handlePrayerFullFlow(actor) {
  try {
    const level = getConduitLevel(actor);

    // Roll exactly once - use this result for all calculations
    const roll = new Roll("1d3");
    await roll.evaluate();
    await roll.toMessage({
      flavor: `${actor.name} - Prayer Roll`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    const result = roll.total;

    // Calculate based on single result
    let pietyGain = result;
    let additionalPiety = 0;
    let effect = '';
    let damageFormula = '';

    if (result === 1) {
      additionalPiety = 1;
      damageFormula = `1d6+${level}`;
      effect = 'THE GODS ARE ANGERED!';
    } else if (result === 2) {
      additionalPiety = 1;
      effect = 'DIVINE GRACE';
    } else if (result === 3) {
      additionalPiety = 2;
      effect = 'DIVINE FAVOR!';
    }
    pietyGain = result + additionalPiety;

    let htmlContent = `<div class="dice-roll ds-conduit-prayer">
      <div class="header" style="color: var(--draw-steel-c-failure);">${effect}</div>
      <div class="prayer-details">
        <p><strong>Roll:</strong> ${result}</p>
        <p><strong>Additional Piety:</strong> +${additionalPiety}</p>
        <p><strong>Total Piety Gain:</strong> +${pietyGain}</p>
        ${damageFormula ? `<p><strong>Psychic Damage:</strong> [[/damage ${damageFormula} psychic]] (unblockable)</p>` : ''}
        ${result === 3 ? `<p><strong>Domain Effect:</strong> Choose one to activate!</p>` : ''}
      </div>
    </div>`;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `${htmlContent}\n[[/gain ${pietyGain} heroic]]`
    });

  } catch (error) {
    console.error("ERROR: Prayer flow error:", error);
  }
}

async function handleSkipFlow(actor) {
  try {
    const roll = new Roll("1d3");
    await roll.evaluate();
    await roll.toMessage({
      flavor: `${actor.name} - Piety Gain (No Prayer)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    const result = roll.total;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="dice-roll ds-conduit-prayer">
        <div class="header" style="color: var(--draw-steel-c-tan);">Prayer Declined</div>
        <div class="prayer-details">
          <p><strong>Roll:</strong> ${result}</p>
          <p><strong>${actor.name}</strong> gains <strong>${result} Piety</strong>.</p>
        </div>
      </div>\n[[/gain ${result} heroic]]`
    });

  } catch (error) {
    console.error("ERROR: Skip flow error:", error);
  }
}


// ===== DIALOG =====

// ===== SOCKET HANDLING =====

async function sendPrayerPromptToPlayer(actor, owningUser) {
  if (game.userId === owningUser.id) {
    // We ARE the owning player - show dialog locally
    await promptConduitPrayer(actor);
  } else {
    // We're not the owning player - send request to them via socket
    const socketData = {
      type: "promptPrayer",
      actorId: actor.id,
      actorName: actor.name,
      requesterId: game.userId,
      requesterName: game.user.name
    };

    // Send to all clients (the owning player will handle it)
    game.socket.emit("module.draw-steel-conduit-prayer", socketData);
  }
}

function setupSocketListener() {
  game.socket.on("module.draw-steel-conduit-prayer", async (message) => {
    if (message.type === "promptPrayer") {
      const actor = game.actors.get(message.actorId);

      // Only handle if we are the owning player
      if (actor && isConduit(actor) && game.user.character?.id === actor.id) {
        await promptConduitPrayer(actor);
      }
    }
  });
}

async function promptConduitPrayer(actor) {
  try {
    const level = getConduitLevel(actor);

    const content = `
      <div class="dialog-content">
        <p><strong>${actor.name}</strong>, it's the start of your turn.</p>
        <p>Will you <strong>PRAY</strong> to the gods before rolling for piety?</p>

        <div class="card">
          <h4>If You Pray (single d3 roll determines effects):</h4>
          <ul>
            <li><strong class="danger">Roll 1:</strong> +2 total piety (1+1) + 1d6+${level} psychic damage (unblockable)</li>
            <li><strong class="primary">Roll 2:</strong> +3 total piety (2+1) (safe)</li>
            <li><strong class="success">Roll 3:</strong> +5 total piety (3+2) + activate one domain effect</li>
          </ul>
        </div>

        <p><em>You'll roll 1d3 for piety. If you pray, the result determines additional effects.</em></p>
      </div>
    `;

    // Use V2 Application framework to avoid deprecation warning
    const choice = await foundry.applications.api.DialogV2.wait({
      window: {
        title: `${actor.name} - Prayer?`
      },
      content,
      buttons: [
        {
          label: 'Pray to the Gods',
          action: 'pray',
          icon: '<i class="fas fa-hands-praying"></i>'
        },
        {
          label: 'Decline Prayer',
          action: 'skip',
          icon: '<i class="fas fa-times-circle"></i>'
        }
      ],
      default: 'pray'
    });

    if (choice === 'pray') {
      await handlePrayerFullFlow(actor);
      return true;
    } else if (choice === 'skip') {
      await handleSkipFlow(actor);
      return true;
    } else {
      // Dialog was closed without a choice - treat as skip
      await handleSkipFlow(actor);
      return true;
    }

  } catch (error) {
    console.error("ERROR: Dialog error:", error);
    return null;
  }
}





// Ready
Hooks.once("ready", () => {
  console.log("INFO: Conduit Prayer Ready");

  // Set up socket listener for cross-client communication
  setupSocketListener();

  // Apply HeroModel wrapper now that Draw Steel is loaded
  const HeroModelClass = window.ds?.data?.Actor?.HeroModel;
  if (HeroModelClass?.prototype) {
    const originalOnStartTurn = HeroModelClass.prototype._onStartTurn;

    // Wrap _onStartTurn to suppress normal piety gain and show prayer dialog
    HeroModelClass.prototype._onStartTurn = async function(combatant) {
      const actor = this.parent;

      // Only intercept Conduit actors
      if (!actor || !isConduit(actor)) {
        // Non-Conduit: use original
        return originalOnStartTurn.call(this, combatant);
      }

      const characterClass = this.class;
      if (characterClass && characterClass.system.turnGain) {
        // Find the owning player
        const owningUser = game.users.contents.find(u => !u.isGM && u.character?.id === actor.id);
        const isPlayerOwned = !!owningUser;

        if (isPlayerOwned) {
          await sendPrayerPromptToPlayer(actor, owningUser);
        } else {
          await promptConduitPrayer(actor);
        }

        // Do NOT call originalOnStartTurn - we've handled it
        return;
      }

      // No turn gain formula: use original
      return originalOnStartTurn.call(this, combatant);
    };

    console.log("INFO: HeroModel._onStartTurn wrapped successfully");
  } else {
    console.warn("WARN: Could not wrap HeroModel methods - class not found at window.ds?.data?.Actor?.HeroModel");
  }
});

