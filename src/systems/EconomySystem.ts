import Phaser from 'phaser';

export class EconomySystem {
  private money: number;
  private scene: Phaser.Scene;
  private moneyText: Phaser.GameObjects.Text | null = null;
  private onMoneyChanged: (money: number) => void;

  constructor(scene: Phaser.Scene, startingMoney: number, onMoneyChanged: (money: number) => void) {
    this.scene = scene;
    this.money = startingMoney;
    this.onMoneyChanged = onMoneyChanged;
  }

  public createUI(x: number, y: number): void {
    this.moneyText = this.scene.add.text(x, y, this.getMoneyString(), {
      fontSize: '24px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    });
  }

  public addMoney(amount: number): void {
    this.money += amount;
    this.updateUI();
    this.onMoneyChanged(this.money);
  }

  public spendMoney(amount: number): boolean {
    if (this.money >= amount) {
      this.money -= amount;
      this.updateUI();
      this.onMoneyChanged(this.money);
      return true;
    }
    return false;
  }

  public getMoney(): number {
    return this.money;
  }

  public canAfford(amount: number): boolean {
    return this.money >= amount;
  }

  private getMoneyString(): string {
    return `$${this.money}`;
  }

  private updateUI(): void {
    if (this.moneyText) {
      this.moneyText.setText(this.getMoneyString());

      // 动画效果
      this.scene.tweens.add({
        targets: this.moneyText,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    }
  }

  public destroy(): void {
    if (this.moneyText) {
      this.moneyText.destroy();
      this.moneyText = null;
    }
  }
}
