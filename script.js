// 角色类
class Character {
  constructor(name, maxHp, maxMp, isPlayer) {
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.maxMp = maxMp;
    this.mp = maxMp;
    this.isPlayer = isPlayer;
  }

  takeDamage(damage) {
    this.hp = Math.max(0, this.hp - damage);
    return damage;
  }

  useMp(amount) {
    if (this.mp >= amount) {
      this.mp -= amount;
      return true;
    }
    return false;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return amount;
  }

  restoreMp(amount) {
    this.mp = Math.min(this.maxMp, this.mp + amount);
    return amount;
  }

  isDead() {
    return this.hp <= 0;
  }
}

// 技能卡牌类
class SkillCard {
  constructor(id, name, damage, range, movement, mpCost, description) {
    this.id = id;
    this.name = name;
    this.damage = damage;
    this.range = range;
    this.movement = movement;
    this.mpCost = mpCost;
    this.description = description;
  }
}

// 游戏类
class Game {
  constructor() {
    this.player = new Character("玩家", 10, 10, true);
    this.ai = new Character("AI", 10, 10, false);
    this.distance = 5;
    this.round = 0;
    this.skillCards = this.createSkillCards();
    this.playerSelectedSkill = null;
    this.aiSelectedSkill = null;
    this.gameOver = false;

    this.initUI();
    this.startNewRound();
  }

  createSkillCards() {
    return [
      new SkillCard(1, "前冲", 2, 2, 2, 2, "向前移动并造成伤害"),
      new SkillCard(2, "防守", 0, 0, 0, 1, "抵挡小于2伤害的攻击"),
      new SkillCard(3, "劈砍", 3, 2, 0, 2, "造成高额伤害"),
      new SkillCard(4, "魔法球", 1, 10, 0, 1, "远距离魔法攻击"),
      new SkillCard(5, "回复", 0, 0, 0, 3, "恢复5点生命值"),
      new SkillCard(6, "闪避", 0, 0, 1, 1, "向后移动躲避攻击"),
      new SkillCard(7, "蓄力", 0, 0, 0, 0, "恢复2点魔法值"),
      new SkillCard(8, "箭矢", 2, 8, 0, 2, "远距离弓箭攻击"),
      new SkillCard(9, "猛击", 4, 1, 0, 3, "近距离高伤害攻击"),
      new SkillCard(10, "突进", 1, 1, 3, 2, "快速向前移动并攻击"),
    ];
  }

  initUI() {
    // 更新角色状态UI
    this.updateCharacterUI();

    // 更新距离显示
    this.updateDistanceUI();

    // 注册重新开始游戏的点击事件
    document.querySelector(".restart-btn").addEventListener("click", () => {
      this.restartGame();
    });
  }

  updateCharacterUI() {
    // 更新玩家状态
    const playerHpFill = document.querySelector(".player-character .hp-fill");
    const playerHpText = document.querySelector(".player-character .hp-text");
    const playerMpFill = document.querySelector(".player-character .mp-fill");
    const playerMpText = document.querySelector(".player-character .mp-text");

    playerHpFill.style.width = `${(this.player.hp / this.player.maxHp) * 100}%`;
    playerHpText.textContent = `${this.player.hp}/${this.player.maxHp}`;
    playerMpFill.style.width = `${(this.player.mp / this.player.maxMp) * 100}%`;
    playerMpText.textContent = `${this.player.mp}/${this.player.maxMp}`;

    // 更新AI状态
    const aiHpFill = document.querySelector(".ai-character .hp-fill");
    const aiHpText = document.querySelector(".ai-character .hp-text");
    const aiMpFill = document.querySelector(".ai-character .mp-fill");
    const aiMpText = document.querySelector(".ai-character .mp-text");

    aiHpFill.style.width = `${(this.ai.hp / this.ai.maxHp) * 100}%`;
    aiHpText.textContent = `${this.ai.hp}/${this.ai.maxHp}`;
    aiMpFill.style.width = `${(this.ai.mp / this.ai.maxMp) * 100}%`;
    aiMpText.textContent = `${this.ai.mp}/${this.ai.maxMp}`;
  }

  updateDistanceUI() {
    const distanceValue = document.querySelector(".distance-value");
    distanceValue.textContent = this.distance;
  }

  // 记录战斗日志
  logMessage(message) {
    const logContent = document.querySelector(".log-content");
    const logEntry = document.createElement("div");
    logEntry.textContent = message;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
  }

  startNewRound() {
    this.round++;
    this.logMessage(`------------ 第 ${this.round} 回合 ------------`);

    // 每回合开始时双方恢复1点MP
    this.player.restoreMp(1);
    this.ai.restoreMp(1);
    this.updateCharacterUI();

    // 为玩家和AI各抽取3张技能卡
    this.dealSkillCards();
  }

  dealSkillCards() {
    // 清空之前的选择
    this.playerSelectedSkill = null;
    this.aiSelectedSkill = null;

    // 随机抽取3张不重复的技能卡
    const shuffledCards = [...this.skillCards].sort(() => Math.random() - 0.5);
    const playerCards = shuffledCards.slice(0, 3);
    const aiCards = shuffledCards.slice(3, 6);

    // 渲染玩家的技能卡牌
    this.renderPlayerSkillCards(playerCards);

    // AI随机选择一张卡牌
    this.aiSelectSkill(aiCards);
  }

  renderPlayerSkillCards(cards) {
    const skillCardsContainer = document.querySelector(".skill-cards");
    skillCardsContainer.innerHTML = "";

    cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "skill-card";
      cardElement.dataset.cardId = card.id;

      cardElement.innerHTML = `
                <h4>${card.name}</h4>
                <p>伤害: ${card.damage}</p>
                <p>攻击范围: ${card.range}</p>
                <p>移动: ${
                  card.movement > 0
                    ? "前进"
                    : card.movement < 0
                    ? "后退"
                    : "不动"
                } ${Math.abs(card.movement)}</p>
                <p>MP消耗: ${card.mpCost}</p>
            `;

      // 如果玩家没有足够的MP使用该技能，禁用该卡牌
      if (card.mpCost > this.player.mp) {
        cardElement.classList.add("disabled");
        cardElement.innerHTML += '<p class="error">MP不足</p>';
      } else {
        // 添加点击事件
        cardElement.addEventListener("click", () => {
          this.onPlayerSelectSkill(card);
        });
      }

      skillCardsContainer.appendChild(cardElement);
    });
  }

  onPlayerSelectSkill(card) {
    // 如果已经选择了技能或者MP不足，不做任何操作
    if (this.playerSelectedSkill || card.mpCost > this.player.mp) {
      return;
    }

    // 设置选中状态
    this.playerSelectedSkill = card;

    // 更新UI
    const skillCards = document.querySelectorAll(".skill-card");
    skillCards.forEach((cardElement) => {
      if (parseInt(cardElement.dataset.cardId) === card.id) {
        cardElement.classList.add("selected");
      }
    });

    // 因为AI已经选择了技能，所以可以进行战斗结算
    setTimeout(() => this.resolveBattle(), 500);
  }

  aiSelectSkill(cards) {
    // 简单AI逻辑：从可用的卡牌中随机选择一张
    const usableCards = cards.filter((card) => card.mpCost <= this.ai.mp);

    if (usableCards.length > 0) {
      // 随机选择一张卡牌
      this.aiSelectedSkill =
        usableCards[Math.floor(Math.random() * usableCards.length)];
    } else {
      // 如果没有可用卡牌，选择第一张（即使无法使用）
      this.aiSelectedSkill = cards[0];
    }
  }

  resolveBattle() {
    // 检查双方是否都选择了技能
    if (!this.playerSelectedSkill || !this.aiSelectedSkill) {
      return;
    }

    // 显示双方选择的技能
    this.logMessage(
      `${this.player.name}选择了【${this.playerSelectedSkill.name}】`
    );
    this.logMessage(`${this.ai.name}选择了【${this.aiSelectedSkill.name}】`);

    // 扣除MP
    const playerCanUseSkill = this.player.useMp(
      this.playerSelectedSkill.mpCost
    );
    const aiCanUseSkill = this.ai.useMp(this.aiSelectedSkill.mpCost);

    // 处理移动
    if (playerCanUseSkill) {
      this.distance -= this.playerSelectedSkill.movement;
    }
    if (aiCanUseSkill) {
      this.distance += this.aiSelectedSkill.movement;
    }

    // 确保距离不会小于0
    this.distance = Math.max(0, this.distance);

    // 更新距离UI
    this.updateDistanceUI();

    // 处理特殊技能效果
    // 处理玩家技能
    if (playerCanUseSkill) {
      if (this.playerSelectedSkill.name === "回复") {
        const healAmount = 5;
        this.player.heal(healAmount);
        this.logMessage(`${this.player.name}恢复了${healAmount}点生命值`);
      } else if (this.playerSelectedSkill.name === "蓄力") {
        const mpAmount = 2;
        this.player.restoreMp(mpAmount);
        this.logMessage(`${this.player.name}恢复了${mpAmount}点魔法值`);
      } else if (this.distance <= this.playerSelectedSkill.range) {
        // 玩家攻击
        let damage = this.playerSelectedSkill.damage;

        // 检查AI是否使用了防守
        if (
          aiCanUseSkill &&
          this.aiSelectedSkill.name === "防守" &&
          damage < 2
        ) {
          this.logMessage(`${this.ai.name}成功防御了攻击！`);
        } else {
          const actualDamage = this.ai.takeDamage(damage);
          this.logMessage(
            `${this.player.name}对${this.ai.name}造成了${actualDamage}点伤害`
          );
        }
      } else {
        this.logMessage(`${this.player.name}的攻击距离不够，未命中`);
      }
    } else {
      this.logMessage(
        `${this.player.name}魔法值不足，无法使用【${this.playerSelectedSkill.name}】`
      );
    }

    // 处理AI技能
    if (aiCanUseSkill) {
      if (this.aiSelectedSkill.name === "回复") {
        const healAmount = 5;
        this.ai.heal(healAmount);
        this.logMessage(`${this.ai.name}恢复了${healAmount}点生命值`);
      } else if (this.aiSelectedSkill.name === "蓄力") {
        const mpAmount = 2;
        this.ai.restoreMp(mpAmount);
        this.logMessage(`${this.ai.name}恢复了${mpAmount}点魔法值`);
      } else if (this.distance <= this.aiSelectedSkill.range) {
        // AI攻击
        let damage = this.aiSelectedSkill.damage;

        // 检查玩家是否使用了防守
        if (
          playerCanUseSkill &&
          this.playerSelectedSkill.name === "防守" &&
          damage < 2
        ) {
          this.logMessage(`${this.player.name}成功防御了攻击！`);
        } else {
          const actualDamage = this.player.takeDamage(damage);
          this.logMessage(
            `${this.ai.name}对${this.player.name}造成了${actualDamage}点伤害`
          );
        }
      } else {
        this.logMessage(`${this.ai.name}的攻击距离不够，未命中`);
      }
    } else {
      this.logMessage(
        `${this.ai.name}魔法值不足，无法使用【${this.aiSelectedSkill.name}】`
      );
    }

    // 更新角色状态UI
    this.updateCharacterUI();

    // 检查游戏是否结束
    if (this.player.isDead() || this.ai.isDead()) {
      this.endGame();
    } else {
      // 开始新回合
      setTimeout(() => this.startNewRound(), 1500);
    }
  }

  endGame() {
    this.gameOver = true;
    const resultMessage = document.querySelector(".result-message");

    if (this.player.isDead() && this.ai.isDead()) {
      resultMessage.textContent = "平局！";
    } else if (this.player.isDead()) {
      resultMessage.textContent = "你失败了！";
    } else {
      resultMessage.textContent = "你获胜了！";
    }

    document.querySelector(".battle-result").classList.add("show");
  }

  restartGame() {
    // 重置游戏状态
    this.player = new Character("玩家", 10, 10, true);
    this.ai = new Character("AI", 10, 10, false);
    this.distance = 5;
    this.round = 0;
    this.playerSelectedSkill = null;
    this.aiSelectedSkill = null;
    this.gameOver = false;

    // 清空战斗日志
    document.querySelector(".log-content").innerHTML = "";

    // 隐藏结果界面
    document.querySelector(".battle-result").classList.remove("show");

    // 更新UI
    this.updateCharacterUI();
    this.updateDistanceUI();

    // 开始新回合
    this.startNewRound();
  }
}

// 初始化游戏
window.onload = () => {
  new Game();
};
