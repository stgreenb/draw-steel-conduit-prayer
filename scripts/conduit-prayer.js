/**
 * Draw Steel - Conduit Prayer Module
 * Handles Conduit class prayer mechanics with single-roll system and piety suppression.
 */

const CONDUIT_PRAYER = {
  CLASS_KEY: 'conduit',
  PIETY_PATH: 'system.hero.primary.value',
  FLAG_SCOPE: 'draw-steel-conduit-prayer',
  FLAG_HANDLING: 'handlingPiety',
  HEROIC_RESOURCE_FLAVOR: 'DRAW_STEEL.Actor.hero.HeroicResourceGain'
};

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
.ds-conduit-prayer .prayer-details p { margin: 4px 0; }
`;

document.head.appendChild(document.createElement('style')).textContent = prayerCSS;

function getConduitPiety(actor) {
  return actor.system?.hero?.primary?.value ?? 0;
}

function getConduitLevel(actor) {
  return actor.system?.details?.level ?? 1;
}

function isConduit(actor) {
  if (!actor || actor.type !== "hero") return false;
  return actor.system?.class?.system?._dsid === CONDUIT_PRAYER.CLASS_KEY;
}

Hooks.on('preUpdateCombatant', async (combatant, updateData) => {
  if (!updateData.active) return;
  const actor = combatant.actor;
  if (!actor || !isConduit(actor)) return;
  if (!actor.system?.class?.system?.turnGain) return;

  await actor.setFlag(CONDUIT_PRAYER.FLAG_SCOPE, CONDUIT_PRAYER.FLAG_HANDLING, true);
});

Hooks.on('preUpdateActor', (actor, updateData) => {
  if (!isConduit(actor)) return;
  if (!foundry.utils.hasProperty(updateData, CONDUIT_PRAYER.PIETY_PATH)) return;

  const newValue = foundry.utils.getProperty(updateData, CONDUIT_PRAYER.PIETY_PATH);
  const isIncreasing = newValue > getConduitPiety(actor);
  const isHandling = actor.getFlag(CONDUIT_PRAYER.FLAG_SCOPE, CONDUIT_PRAYER.FLAG_HANDLING);

  if (isHandling && isIncreasing) return false;
});

Hooks.on('preCreateChatMessage', (message, data, options, user) => {
  const flavor = data.flavor;
  const parts = data.system?.parts ?? [];
  const isResourceGain = flavor === CONDUIT_PRAYER.HEROIC_RESOURCE_FLAVOR ||
    parts.some(p => p.flavor === CONDUIT_PRAYER.HEROIC_RESOURCE_FLAVOR);
  
  if (!isResourceGain) return true;

  const actor = ChatMessage.getSpeakerActor(data.speaker);
  if (!actor || !isConduit(actor)) return true;
  if (!actor.getFlag(CONDUIT_PRAYER.FLAG_SCOPE, CONDUIT_PRAYER.FLAG_HANDLING)) return true;

  return false;
});

async function handlePrayerFlow(actor, isPraying) {
  const level = getConduitLevel(actor);
  const roll = new Roll("1d3");
  await roll.evaluate();
  await roll.toMessage({
    flavor: `${actor.name} - Prayer Roll`,
    speaker: ChatMessage.getSpeaker({ actor })
  });

  const result = roll.total;
  let additionalPiety = 0;
  let effect = '';
  let damageFormula = '';

  if (isPraying) {
    if (result === 1) {
      additionalPiety = 1;
      damageFormula = `1d6+${level}`;
      effect = 'THE GODS ARE ANGERED!';
    } else if (result === 2) {
      additionalPiety = 1;
      effect = 'DIVINE GRACE';
    } else {
      additionalPiety = 2;
      effect = 'DIVINE FAVOR!';
    }
  }

  const pietyGain = result + additionalPiety;
  const headerColor = isPraying
    ? (result === 1 ? 'var(--draw-steel-c-failure)' : result === 2 ? 'var(--draw-steel-c-primary)' : 'var(--draw-steel-c-success)')
    : 'var(--draw-steel-c-tan)';

  const htmlContent = `
    <div class="dice-roll ds-conduit-prayer">
      <div class="header" style="color: ${headerColor}">${isPraying ? effect : 'Prayer Declined'}</div>
      <div class="prayer-details">
        <p><strong>Roll:</strong> ${result}</p>
        ${isPraying && additionalPiety > 0 ? `<p><strong>Additional:</strong> +${additionalPiety}</p>` : ''}
        <p><strong>Piety Gain:</strong> +${pietyGain}</p>
        ${damageFormula ? `<p><strong>Psychic Damage:</strong> [[/damage ${damageFormula} psychic]] (unblockable)</p>` : ''}
        ${isPraying && result === 3 ? '<p><strong>Domain:</strong> Choose one to activate!</p>' : ''}
      </div>
    </div>`;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `${htmlContent}\n[[/gain ${pietyGain} heroic]]`
  });
}

async function promptConduitPrayer(actor) {
  const level = getConduitLevel(actor);
  const content = `
    <div class="dialog-content">
      <p><strong>${actor.name}</strong>, it's the start of your turn.</p>
      <p>Will you <strong>PRAY</strong> to the gods before rolling for piety?</p>
      <div class="card">
        <h4>If You Pray (single d3 roll):</h4>
        <ul>
          <li><strong class="danger">Roll 1:</strong> +2 piety + 1d6+${level} psychic damage</li>
          <li><strong class="primary">Roll 2:</strong> +3 piety (safe)</li>
          <li><strong class="success">Roll 3:</strong> +5 piety + domain effect</li>
        </ul>
      </div>
      <p><em>1d3 for piety. Prayer adds bonus based on result.</em></p>
    </div>`;

  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${actor.name} - Prayer?` },
    content,
    buttons: [
      { label: 'Pray to the Gods', action: 'pray', icon: '<i class="fas fa-hands-praying"></i>' },
      { label: 'Decline Prayer', action: 'skip', icon: '<i class="fas fa-times-circle"></i>' }
    ],
    default: 'pray'
  });

  await handlePrayerFlow(actor, choice === 'pray');
  await actor.unsetFlag(CONDUIT_PRAYER.FLAG_SCOPE, CONDUIT_PRAYER.FLAG_HANDLING);
}

async function sendPrayerPrompt(actor, owningUser) {
  if (game.userId === owningUser.id) {
    await promptConduitPrayer(actor);
  } else {
    game.socket.emit("module.draw-steel-conduit-prayer", { type: "promptPrayer", actorId: actor.id });
  }
}

function setupSocketListener() {
  game.socket.on("module.draw-steel-conduit-prayer", async (message) => {
    if (message.type !== "promptPrayer") return;
    const actor = game.actors.get(message.actorId);
    if (actor && isConduit(actor) && game.user.character?.id === actor.id) {
      await promptConduitPrayer(actor);
    }
  });
}

Hooks.once("ready", () => {
  const HeroModel = window.ds?.data?.Actor?.HeroModel;
  if (!HeroModel?.prototype?._onStartTurn) {
    console.warn("Conduit Prayer: HeroModel or _onStartTurn not found");
    return;
  }

  setupSocketListener();

  libWrapper.register(
    "draw-steel-conduit-prayer",
    "window.ds.data.Actor.HeroModel.prototype._onStartTurn",
    async function(wrapped, combatant) {
      const actor = this.parent;
      if (actor && isConduit(actor) && this.class?.system?.turnGain) {
        const owningUser = game.users.contents.find(u => !u.isGM && u.character?.id === actor.id);
        if (owningUser) await sendPrayerPrompt(actor, owningUser);
        return;
      }
      return wrapped(combatant);
    },
    "MIXED"
  );
});
