declare module 'react-native-gifted-chat' {
  import React from 'react';

  export const GiftedChat: React.ComponentType<any>;
  export const Bubble: React.ComponentType<any>;
  export const SystemMessage: React.ComponentType<any>;
  export interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date | number;
    user: {
      _id: string | number;
      name?: string;
      avatar?: string;
    };
    image?: string;
    video?: string;
    audio?: string;
    system?: boolean;
    sent?: boolean;
    received?: boolean;
    pending?: boolean;
    quickReplies?: any;
  }
}
