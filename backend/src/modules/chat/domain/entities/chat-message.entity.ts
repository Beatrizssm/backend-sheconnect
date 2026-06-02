export type ChatMessageProps = {
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  read?: boolean;
  createdAt?: Date;
};

export class ChatMessageEntity {
  private constructor(private readonly props: Required<ChatMessageProps>) {}

  static create(props: ChatMessageProps): ChatMessageEntity {
    return new ChatMessageEntity({
      id: props.id ?? crypto.randomUUID(),
      conversationId: props.conversationId,
      senderId: props.senderId,
      receiverId: props.receiverId,
      message: props.message.trim(),
      read: props.read ?? false,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  toPrimitives(): Required<ChatMessageProps> {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get conversationId(): string {
    return this.props.conversationId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get receiverId(): string {
    return this.props.receiverId;
  }

  get message(): string {
    return this.props.message;
  }

  get read(): boolean {
    return this.props.read;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
