import Phaser from 'phaser';
import { UserManager } from '../systems/UserManager';

export class LoginScene extends Phaser.Scene {
  private loginMode: boolean = true; // true = login, false = register
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private messageText!: Phaser.GameObjects.Text;
  private modeToggleText!: Phaser.GameObjects.Text;
  private submitButton!: HTMLButtonElement;

  constructor() {
    super('LoginScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Check if already logged in
    if (UserManager.isLoggedIn()) {
      this.scene.start('MenuScene');
      return;
    }

    // Animated gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // Add decorative elements
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.7)
      );
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 0.9),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Title with shadow effect
    const titleShadow = this.add.text(width / 2 + 3, 103, "CHEF'S LAST STAND", {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, 100, "CHEF'S LAST STAND", {
      fontSize: '48px',
      color: '#fbbf24',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Animate title
    this.tweens.add({
      targets: title,
      y: 95,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: titleShadow,
      y: 98,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle with glow effect
    this.add.text(width / 2, 165, '━━━━━━━━━━━━━━━━━━', {
      fontSize: '16px',
      color: '#8b5cf6',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, '🎮 로그인 또는 회원가입 🎮', {
      fontSize: '20px',
      color: '#e0e7ff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // Create HTML form elements
    this.createFormInputs(width, height);

    // Mode toggle text with better styling
    this.modeToggleText = this.add.text(width / 2, height - 80, '💡 계정이 없으신가요? 회원가입', {
      fontSize: '14px',
      color: '#8b5cf6',
      fontFamily: 'Courier New',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    this.modeToggleText.on('pointerdown', () => {
      this.loginMode = !this.loginMode;
      this.updateUI();
    });

    // Add hover effect with scale
    this.modeToggleText.on('pointerover', () => {
      this.modeToggleText.setColor('#a78bfa');
      this.modeToggleText.setScale(1.05);
    });
    this.modeToggleText.on('pointerout', () => {
      this.modeToggleText.setColor('#8b5cf6');
      this.modeToggleText.setScale(1);
    });

    // Message text with better visibility
    this.messageText = this.add.text(width / 2, height - 40, '', {
      fontSize: '14px',
      color: '#ef4444',
      fontFamily: 'Courier New',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5);

    this.updateUI();

    // Store references for cleanup
    this.events.on('shutdown', this.cleanup, this);
  }

  private createFormInputs(width: number, height: number) {
    const formContainer = document.createElement('div');
    formContainer.id = 'login-form';
    formContainer.style.position = 'absolute';
    formContainer.style.left = `${width / 2 - 175}px`;
    formContainer.style.top = `${height / 2 - 80}px`;
    formContainer.style.width = '350px';
    formContainer.style.fontFamily = 'Courier New';
    formContainer.style.padding = '30px';
    formContainer.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))';
    formContainer.style.borderRadius = '12px';
    formContainer.style.border = '2px solid rgba(139, 92, 246, 0.5)';
    formContainer.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
    formContainer.style.backdropFilter = 'blur(10px)';

    // Username input
    const usernameLabel = document.createElement('div');
    usernameLabel.textContent = '👤 사용자 이름:';
    usernameLabel.style.color = '#e0e7ff';
    usernameLabel.style.marginBottom = '8px';
    usernameLabel.style.fontSize = '14px';
    usernameLabel.style.fontWeight = 'bold';

    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = '사용자 이름을 입력하세요';
    this.usernameInput.style.width = 'calc(100% - 24px)';
    this.usernameInput.style.padding = '12px';
    this.usernameInput.style.fontSize = '16px';
    this.usernameInput.style.fontFamily = 'Courier New';
    this.usernameInput.style.marginBottom = '20px';
    this.usernameInput.style.backgroundColor = 'rgba(26, 26, 46, 0.8)';
    this.usernameInput.style.color = '#ffffff';
    this.usernameInput.style.border = '2px solid rgba(139, 92, 246, 0.5)';
    this.usernameInput.style.borderRadius = '8px';
    this.usernameInput.style.outline = 'none';
    this.usernameInput.style.transition = 'all 0.3s ease';

    this.usernameInput.addEventListener('focus', () => {
      this.usernameInput.style.border = '2px solid #8b5cf6';
      this.usernameInput.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.5)';
    });
    this.usernameInput.addEventListener('blur', () => {
      this.usernameInput.style.border = '2px solid rgba(139, 92, 246, 0.5)';
      this.usernameInput.style.boxShadow = 'none';
    });

    // Password input
    const passwordLabel = document.createElement('div');
    passwordLabel.textContent = '🔒 비밀번호:';
    passwordLabel.style.color = '#e0e7ff';
    passwordLabel.style.marginBottom = '8px';
    passwordLabel.style.fontSize = '14px';
    passwordLabel.style.fontWeight = 'bold';

    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.placeholder = '비밀번호를 입력하세요';
    this.passwordInput.style.width = 'calc(100% - 24px)';
    this.passwordInput.style.padding = '12px';
    this.passwordInput.style.fontSize = '16px';
    this.passwordInput.style.fontFamily = 'Courier New';
    this.passwordInput.style.marginBottom = '24px';
    this.passwordInput.style.backgroundColor = 'rgba(26, 26, 46, 0.8)';
    this.passwordInput.style.color = '#ffffff';
    this.passwordInput.style.border = '2px solid rgba(139, 92, 246, 0.5)';
    this.passwordInput.style.borderRadius = '8px';
    this.passwordInput.style.outline = 'none';
    this.passwordInput.style.transition = 'all 0.3s ease';

    this.passwordInput.addEventListener('focus', () => {
      this.passwordInput.style.border = '2px solid #8b5cf6';
      this.passwordInput.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.5)';
    });
    this.passwordInput.addEventListener('blur', () => {
      this.passwordInput.style.border = '2px solid rgba(139, 92, 246, 0.5)';
      this.passwordInput.style.boxShadow = 'none';
    });

    // Submit button
    this.submitButton = document.createElement('button');
    this.submitButton.textContent = '🚀 로그인';
    this.submitButton.style.width = '100%';
    this.submitButton.style.padding = '14px';
    this.submitButton.style.fontSize = '18px';
    this.submitButton.style.fontFamily = 'Courier New';
    this.submitButton.style.fontWeight = 'bold';
    this.submitButton.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    this.submitButton.style.color = '#000000';
    this.submitButton.style.border = 'none';
    this.submitButton.style.borderRadius = '8px';
    this.submitButton.style.cursor = 'pointer';
    this.submitButton.style.transition = 'all 0.3s ease';
    this.submitButton.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.4)';

    this.submitButton.addEventListener('mouseenter', () => {
      this.submitButton.style.transform = 'translateY(-2px) scale(1.02)';
      this.submitButton.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.6)';
    });
    this.submitButton.addEventListener('mouseleave', () => {
      this.submitButton.style.transform = 'translateY(0) scale(1)';
      this.submitButton.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.4)';
    });
    this.submitButton.addEventListener('click', () => this.handleSubmit());

    // Enter key support
    this.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSubmit();
      }
    });

    // Append elements
    formContainer.appendChild(usernameLabel);
    formContainer.appendChild(this.usernameInput);
    formContainer.appendChild(passwordLabel);
    formContainer.appendChild(this.passwordInput);
    formContainer.appendChild(this.submitButton);

    document.body.appendChild(formContainer);

    // Focus username input
    this.usernameInput.focus();
  }

  private async handleSubmit() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showMessage('모든 필드를 입력하세요', '#ff6666');
      return;
    }

    // Show loading message
    this.showMessage('처리 중...', '#aaaaaa');

    let result;
    if (this.loginMode) {
      result = await UserManager.login(username, password);
    } else {
      result = await UserManager.register(username, password);
    }

    if (result.success) {
      this.showMessage(result.message, '#66ff66');
      this.time.delayedCall(500, () => {
        this.cleanup();
        this.scene.start('MenuScene');
      });
    } else {
      this.showMessage(result.message, '#ff6666');
    }
  }

  private updateUI() {
    if (this.loginMode) {
      this.modeToggleText.setText('💡 계정이 없으신가요? 회원가입');
      this.submitButton.textContent = '🚀 로그인';
    } else {
      this.modeToggleText.setText('💡 이미 계정이 있으신가요? 로그인');
      this.submitButton.textContent = '✨ 회원가입';
    }

    this.messageText.setText('');
    this.usernameInput.value = '';
    this.passwordInput.value = '';
    this.usernameInput.focus();
  }

  private showMessage(message: string, color: string) {
    this.messageText.setText(message);
    this.messageText.setColor(color);

    // Add pulse animation for messages
    this.tweens.add({
      targets: this.messageText,
      scale: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  private cleanup() {
    const formElement = document.getElementById('login-form');
    if (formElement) {
      formElement.remove();
    }
  }
}
