import { ChatSender } from './ChatSender';

export interface ChatMessage {
    time: Date;
    sender: ChatSender;
    content: string;
}
