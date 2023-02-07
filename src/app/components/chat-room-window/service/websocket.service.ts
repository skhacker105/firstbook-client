import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../../../core/models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket = io(environment.api);
  constructor() { }

  joinRoom(roomKey: string) {
    this.socket.emit('join', roomKey);
  }

  sendMessage(payload: any) {
    this.socket.emit('message', payload);
  }

  newMessageReceived() {
    const observable = new Observable<ChatMessage>(observer => {
      this.socket.on('new message', (message) => {
        observer.next(message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  typing(message: ChatMessage) {
    this.socket.emit('typing', message);
  }

  receivedTyping():Observable<ChatMessage> {
    const observable = new Observable<ChatMessage>(observer => {
      this.socket.on('typing', (message) => {
        observer.next(message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }
}
