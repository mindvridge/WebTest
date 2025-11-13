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

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a2a, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 100, "CHEF'S LAST STAND", {
      fontSize: '48px',
      color: '#ffaa00',
      fontFamily: 'Courier New',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 160, '로그인 또는 회원가입', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // Create HTML form elements
    this.createFormInputs(width, height);

    // Mode toggle text
    this.modeToggleText = this.add.text(width / 2, height - 100, '계정이 없으신가요? 회원가입', {
      fontSize: '16px',
      color: '#ffaa00',
      fontFamily: 'Courier New',
    }).setOrigin(0.5).setInteractive();

    this.modeToggleText.on('pointerdown', () => {
      this.loginMode = !this.loginMode;
      this.updateUI();
    });

    // Add hover effect
    this.modeToggleText.on('pointerover', () => {
      this.modeToggleText.setColor('#ffcc00');
    });
    this.modeToggleText.on('pointerout', () => {
      this.modeToggleText.setColor('#ffaa00');
    });

    // Message text
    this.messageText = this.add.text(width / 2, height - 50, '', {
      fontSize: '16px',
      color: '#ff6666',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    this.updateUI();

    // Store references for cleanup
    this.events.on('shutdown', this.cleanup, this);
  }

  private createFormInputs(width: number, height: number) {
    const formContainer = document.createElement('div');
    formContainer.id = 'login-form';
    formContainer.style.position = 'absolute';
    formContainer.style.left = `${width / 2 - 150}px`;
    formContainer.style.top = `${height / 2 - 100}px`;
    formContainer.style.width = '300px';
    formContainer.style.fontFamily = 'Courier New';

    // Username input
    const usernameLabel = document.createElement('div');
    usernameLabel.textContent = '사용자 이름:';
    usernameLabel.style.color = '#ffffff';
    usernameLabel.style.marginBottom = '5px';
    usernameLabel.style.fontSize = '16px';

    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.style.width = '100%';
    this.usernameInput.style.padding = '10px';
    this.usernameInput.style.fontSize = '16px';
    this.usernameInput.style.fontFamily = 'Courier New';
    this.usernameInput.style.marginBottom = '20px';
    this.usernameInput.style.backgroundColor = '#1a1a1a';
    this.usernameInput.style.color = '#ffffff';
    this.usernameInput.style.border = '2px solid #555555';
    this.usernameInput.style.borderRadius = '4px';

    // Password input
    const passwordLabel = document.createElement('div');
    passwordLabel.textContent = '비밀번호:';
    passwordLabel.style.color = '#ffffff';
    passwordLabel.style.marginBottom = '5px';
    passwordLabel.style.fontSize = '16px';

    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.style.width = '100%';
    this.passwordInput.style.padding = '10px';
    this.passwordInput.style.fontSize = '16px';
    this.passwordInput.style.fontFamily = 'Courier New';
    this.passwordInput.style.marginBottom = '20px';
    this.passwordInput.style.backgroundColor = '#1a1a1a';
    this.passwordInput.style.color = '#ffffff';
    this.passwordInput.style.border = '2px solid #555555';
    this.passwordInput.style.borderRadius = '4px';

    // Submit button
    this.submitButton = document.createElement('button');
    this.submitButton.textContent = '로그인';
    this.submitButton.style.width = '100%';
    this.submitButton.style.padding = '12px';
    this.submitButton.style.fontSize = '18px';
    this.submitButton.style.fontFamily = 'Courier New';
    this.submitButton.style.fontWeight = 'bold';
    this.submitButton.style.backgroundColor = '#ffaa00';
    this.submitButton.style.color = '#000000';
    this.submitButton.style.border = 'none';
    this.submitButton.style.borderRadius = '4px';
    this.submitButton.style.cursor = 'pointer';

    this.submitButton.addEventListener('mouseenter', () => {
      this.submitButton.style.backgroundColor = '#ffcc00';
    });
    this.submitButton.addEventListener('mouseleave', () => {
      this.submitButton.style.backgroundColor = '#ffaa00';
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
      this.modeToggleText.setText('계정이 없으신가요? 회원가입');
      this.submitButton.textContent = '로그인';
    } else {
      this.modeToggleText.setText('이미 계정이 있으신가요? 로그인');
      this.submitButton.textContent = '회원가입';
    }

    this.messageText.setText('');
    this.usernameInput.value = '';
    this.passwordInput.value = '';
    this.usernameInput.focus();
  }

  private showMessage(message: string, color: string) {
    this.messageText.setText(message);
    this.messageText.setColor(color);
  }

  private cleanup() {
    const formElement = document.getElementById('login-form');
    if (formElement) {
      formElement.remove();
    }
  }
}
