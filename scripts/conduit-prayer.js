/**
 * Draw Steel - Conduit Prayer Module
 * CORRECTED VERSION - Implements official Draw Steel prayer mechanics
 *
 * CORRECT FLOW:
 * 1. Turn starts -> preUpdateCombatant hook suppresses normal 1d3 piety gain
 * 2. Dialog appears: "Will you PRAY before rolling?"
 * 3. Player chooses PRAY or SKIP
 * 4. Roll 1d3 for baseline piety
 * 5. If PRAY: Roll 1d3 again for prayer effects and apply bonuses
 * 6. Apply total piety gain + any effects
 */

// Draw Steel's classes will be available via global scope after ready hook

const CONDUIT_PRAYER = {
  PIETY_PATH: "system.hero.primary.value",
  PIETY_MAX_PATH: "system.hero.primary.max",
};

console.log("INFO: Conduit Prayer module starting...");

// Inject custom CSS for prayer messages
const prayerCSS = `
<style>
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
</style>
`;

// Add CSS to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = prayerCSS;
  document.head.appendChild(styleElement);
}

// ==============================================================================
// PROTOTYPE WRAP: Intercept Draw Steel's updateResource call
// ==============================================================================

// Wrapper will be applied in ready hook after Draw Steel loads

// ==============================================================================
// ==============================================================================
// CORE PRAYER SYSTEM - No longer needs tracking hooks
// ==============================================================================

// ===== DATA ACCESSORS =====

function getConduitPiety(actor) {
  try {
    const piety = actor.system?.hero?.primary?.value ?? 0;
    return typeof piety === 'number' && !isNaN(piety) ? piety : 0;
  } catch (error) {
    return 0;
  }
}

function getConduitPietyMax(actor) {
  try {
    const maxPiety = actor.system?.hero?.primary?.max ?? 7;
    return (typeof maxPiety === 'number' && !isNaN(maxPiety) && maxPiety > 0) ? maxPiety : 7;
  } catch (error) {
    return 7;
  }
}

function getConduitLevel(actor) {
  try {
    const level = actor.system?.details?.level ?? 1;
    return (typeof level === 'number' && !isNaN(level) && level >= 1) ? level : 1;
  } catch (error) {
    return 1;
  }
}

function getConduitStamina(actor) {
  try {
    const stamina = actor.system?.stamina?.value ?? 0;
    return typeof stamina === 'number' && !isNaN(stamina) ? stamina : 0;
  } catch (error) {
    return 0;
  }
}

// ===== CLASS DETECTION =====

function isConduit(actor) {
  if (!actor || actor.type !== "hero") return false;
  try {
    // Check both _dsid and dsid (different versions/paths)
    if (actor.system?.class?.system?._dsid === "conduit") return true;
    if (actor.system?.class?.system?.dsid === "conduit") return true;
    if (actor.system?.class?.name?.toLowerCase() === "conduit") return true;
    const classItem = actor.items?.find(i => i.type === "class");
    if (classItem?.system?._dsid === "conduit") return true;
    if (classItem?.system?.dsid === "conduit") return true;
    return false;
  } catch (error) {
    return false;
  }
}

// ===== PRAYER HANDLERS =====

async function handlePrayerFullFlow(actor) {
  try {
    console.log(`INFO: Starting prayer flow for ${actor.name}`);

    const level = getConduitLevel(actor);
    const maxPiety = getConduitPietyMax(actor);
    const currentPiety = getConduitPiety(actor);

    // Roll 1d3 for baseline piety
    const baselineRoll = new Roll("1d3");
    await baselineRoll.evaluate();
    const baseline = baselineRoll.total;

    // Roll 1d3 for prayer effects
    const prayerRoll = new Roll("1d3");
    await prayerRoll.evaluate();
    const prayerResult = prayerRoll.total;

    console.log(`INFO: ${actor.name} PRAYER: baseline ${baseline} + prayer ${prayerResult}`);

    
    let additionalPiety = 0;
    let damageDealt = 0;
    let htmlContent = "";

    if (prayerResult === 1) {
      additionalPiety = 1;

      htmlContent = `<div class="dice-roll ds-conduit-prayer">
        <div class="header" style="color: var(--draw-steel-c-failure);">⚡ THE GODS ARE ANGERED!</div>
        <div class="prayer-details">
          <p><strong>Baseline Roll:</strong> ${baseline}</p>
          <p><strong>Prayer Roll:</strong> 1</p>
          <p><strong>Piety Gain:</strong> +${baseline} (baseline) +${additionalPiety} (prayer) = <strong>+${baseline + additionalPiety}</strong></p>
          <p><strong>Psychic Damage:</strong> [[/damage 1d6+${level} psychic]] (unblockable)</p>
        </div>
      </div>`;

      const updateObj = {};
      updateObj[CONDUIT_PRAYER.PIETY_PATH] = Math.min(currentPiety + baseline + additionalPiety, maxPiety);
      await actor.update(updateObj);

    } else if (prayerResult === 2) {
      additionalPiety = 1;

      htmlContent = `<div class="dice-roll ds-conduit-prayer">
        <div class="header" style="color: var(--draw-steel-c-tan);">✨ DIVINE GRACE</div>
        <div class="prayer-details">
          <p><strong>Baseline Roll:</strong> ${baseline}</p>
          <p><strong>Prayer Roll:</strong> 2</p>
          <p><strong>Piety Gain:</strong> +${baseline} (baseline) +${additionalPiety} (prayer) = <strong>+${baseline + additionalPiety}</strong></p>
        </div>
      </div>`;

      const updateObj = {};
      updateObj[CONDUIT_PRAYER.PIETY_PATH] = Math.min(currentPiety + baseline + additionalPiety, maxPiety);
      await actor.update(updateObj);

    } else if (prayerResult === 3) {
      additionalPiety = 2;

      htmlContent = `<div class="dice-roll ds-conduit-prayer">
        <div class="header" style="color: var(--draw-steel-c-success);">🌟 DIVINE FAVOR!</div>
        <div class="prayer-details">
          <p><strong>Baseline Roll:</strong> ${baseline}</p>
          <p><strong>Prayer Roll:</strong> 3</p>
          <p><strong>Piety Gain:</strong> +${baseline} (baseline) +${additionalPiety} (prayer) = <strong>+${baseline + additionalPiety}</strong></p>
          <p><strong>Domain Effect:</strong> Choose one to activate!</p>
        </div>
      </div>`;

      const updateObj = {};
      updateObj[CONDUIT_PRAYER.PIETY_PATH] = Math.min(currentPiety + baseline + additionalPiety, maxPiety);
      await actor.update(updateObj);
    }

    await actor.setFlag(CONDUIT_PRAYER.FLAG_SCOPE, CONDUIT_PRAYER.FLAG_LAST_RESULT, prayerResult);

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: htmlContent
    });

    console.log(`INFO: ${actor.name} prayer completed: +${baseline + additionalPiety} piety${damageDealt > 0 ? ` (damage: ${damageDealt})` : ''}`);
  } catch (error) {
    console.error("ERROR: Prayer flow error:", error);
  }
}

async function handleNormalGain(actor) {
  try {
    console.log(`INFO: NORMAL PIETY GAIN for ${actor.name} (no prayer)`);

    
    const maxPiety = getConduitPietyMax(actor);
    const currentPiety = getConduitPiety(actor);

    // Roll 1d3 for baseline piety only
    const baselineRoll = new Roll("1d3");
    await baselineRoll.evaluate();
    const baseline = baselineRoll.total;

    const updateObj = {};
    updateObj[CONDUIT_PRAYER.PIETY_PATH] = Math.min(currentPiety + baseline, maxPiety);
    await actor.update(updateObj);

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="dice-roll ds-conduit-prayer">
        <div class="header" style="color: var(--draw-steel-c-tan);">Normal Piety Gain</div>
        <div class="prayer-details">
          <p><strong>${actor.name}</strong> gains <strong>${baseline} Piety</strong>.</p>
        </div>
      </div>`
    });

    console.log(`INFO: ${actor.name} normal gain: +${baseline} piety`);
  } catch (error) {
    console.error("ERROR: Normal gain error:", error);
  }
}

async function handleSkipFullFlow(actor) {
  try {
    console.log(`INFO: SKIP FLOW for ${actor.name}`);

    const maxPiety = getConduitPietyMax(actor);
    const currentPiety = getConduitPiety(actor);

    // Roll 1d3 for baseline piety only
    const baselineRoll = new Roll("1d3");
    await baselineRoll.evaluate();
    const baseline = baselineRoll.total;

    
    const updateObj = {};
    updateObj[CONDUIT_PRAYER.PIETY_PATH] = Math.min(currentPiety + baseline, maxPiety);
    await actor.update(updateObj);

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="dice-roll ds-conduit-prayer">
        <div class="header" style="color: var(--draw-steel-c-tan);">Prayer Declined</div>
        <div class="prayer-details">
          <p><strong>${actor.name}</strong> declines to pray and gains <strong>${baseline} Piety</strong>.</p>
        </div>
      </div>`
    });

    console.log(`INFO: ${actor.name} skipped prayer: +${baseline} piety`);
  } catch (error) {
    console.error("ERROR: Skip flow error:", error);
  }
}

// ===== DIALOG =====

// Track active dialogs to prevent duplicates
const activeDialogs = new Map();

// ===== SOCKET HANDLING =====

/**
 * Send prayer prompt to the owning player via socket
 */
async function sendPrayerPromptToPlayer(actor, owningUser) {
  if (game.userId === owningUser.id) {
    // We ARE the owning player - show dialog locally
    await promptConduitPrayer(actor);
  } else {
    // We're not the owning player - send request to them via socket
    console.log(`INFO: Sending prayer prompt to ${owningUser.name}`);

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

/**
 * Listen for socket messages from other clients
 */
function setupSocketListener() {
  game.socket.on("module.draw-steel-conduit-prayer", async (message) => {
    if (message.type === "promptPrayer") {
      const actor = game.actors.get(message.actorId);

      // Only handle if we are a player and this is our character
      if (actor && isConduit(actor) && !game.user.isGM && game.user.character?.id === actor.id) {
        console.log(`INFO: Prayer prompt received for ${message.actorName}`);
        await promptConduitPrayer(actor);
      }
    }
  });
}

async function promptConduitPrayer(actor) {
  // Prevent multiple dialogs for same actor
  if (activeDialogs.has(actor.id)) {
    console.log(`WARN: Dialog already active for ${actor.name}`);
    return false;
  }

  try {
    // This function is now only called on the correct client, so just show the dialog

    // Mark dialog as active
    activeDialogs.set(actor.id, true);

    const level = getConduitLevel(actor);

    const content = `
      <div class="dialog-content">
        <p><strong>${actor.name}</strong>, it's the start of your turn.</p>
        <p>Will you <strong>PRAY</strong> to the gods before rolling for piety?</p>

        <div class="card">
          <h4>If You Pray (d3 roll determines prayer effects):</h4>
          <ul>
            <li><strong class="danger">Roll 1:</strong> +1 additional piety + 1d6+${level} psychic damage (unblockable)</li>
            <li><strong class="primary">Roll 2:</strong> +1 additional piety (safe)</li>
            <li><strong class="success">Roll 3:</strong> +2 additional piety + activate one domain effect</li>
          </ul>
        </div>

        <p><em>You'll roll 1d3 for baseline piety either way. Prayer adds to that result.</em></p>
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

    // Clean up dialog tracking
    activeDialogs.delete(actor.id);

    if (choice === 'pray') {
      console.log(`INFO: ${actor.name} chose to PRAY`);
      await handlePrayerFullFlow(actor);
      return true;
    } else if (choice === 'skip') {
      console.log(`INFO: ${actor.name} chose to SKIP`);
      await handleSkipFullFlow(actor);
      return true;
    } else {
      // Dialog was closed without a choice
      console.log(`WARN: ${actor.name} dialog closed - treating as skip`);
      await handleSkipFullFlow(actor);
      return true;
    }

  } catch (error) {
    console.error("ERROR: Dialog error:", error);
    activeDialogs.delete(actor.id);
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
    const originalUpdateResource = HeroModelClass.prototype.updateResource;

    // Wrap _onStartTurn to intercept before chat message is created
    HeroModelClass.prototype._onStartTurn = async function(combatant) {
      const actor = this.parent;

      // Only intercept Conduit actors
      if (!actor || !isConduit(actor)) {
        // Non-Conduit: use original
        return originalOnStartTurn.call(this, combatant);
      }

      console.log(`INFO: HeroModel._onStartTurn called: actor=${actor?.name}`);

      const characterClass = this.class;
      if (characterClass && characterClass.system.turnGain) {
        console.log(`INFO: INTERCEPTED: ${actor.name} turn gain (formula: ${characterClass.system.turnGain})`);

        // Calculate the roll value but don't send to chat
        // Try multiple possible paths for DSRoll
        const DSRoll = window.ds?.rolls?.DSRoll || window.ds?.rolls?.base?.DSRoll || window.DrawSteel?.rolls?.DSRoll;
        let recoveryRoll;
        if (!DSRoll) {
          console.error("WARN: Could not find DSRoll class, using fallback Roll");
          // Fallback to Foundry's Roll if DSRoll not available
          const { Roll } = foundry.dice;
          recoveryRoll = new Roll(characterClass.system.turnGain, characterClass.getRollData());
          await recoveryRoll.evaluate();
        } else {
          recoveryRoll = new DSRoll(characterClass.system.turnGain, characterClass.getRollData(), {
            flavor: this.class.system.primary,
          });
          await recoveryRoll.evaluate();
        }

        console.log(`INFO: Rolled ${recoveryRoll.total} for ${actor.name} piety gain`);

        // Check if this actor is assigned to a player character
        const assignedPlayer = game.users.contents.find(u => !u.isGM && u.character?.id === actor.id);
        const isPlayerOwned = !!assignedPlayer;

        console.log(`INFO: ${actor.name}: GM=${game.user.isGM}, Owner=${assignedPlayer?.name || 'None'}`);

        if (isPlayerOwned) {
          console.log(`INFO: Actor assigned to player ${assignedPlayer.name} - routing prayer dialog`);
          await sendPrayerPromptToPlayer(actor, assignedPlayer);
        } else {
          console.log(`INFO: Applying normal piety gain (GM-owned actor)`);
          await handleNormalGain(actor);
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

