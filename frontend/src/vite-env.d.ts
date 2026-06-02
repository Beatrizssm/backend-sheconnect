/// <reference types="vite/client" />

interface GoogleCredentialResponse {
  credential?: string;
}

interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize(options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
        }): void;
        renderButton(
          parent: HTMLElement,
          options: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            width?: number;
          },
        ): void;
      };
    };
  };
}
