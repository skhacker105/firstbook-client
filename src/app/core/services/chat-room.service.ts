import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatMessage, ChatRoom, ChatRoomUsers } from '../models/chat.model';
import { ServerResponse } from '../models/server-response.model';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';
import { HelperService } from './helper.service';

const domain = environment.api;
const getAllLinkedChatRoomsEndpoint = domain + 'chat/getAlLinkedChatlRoom/';
const getAllChatRoomsEndpoint = domain + 'chat/getAll';
const getSingleChatRoomsEndpoint = domain + 'chat/getSingle/';
const getChatRoomMessagesEndpoint = domain + 'chat/message/';
const addChatRoomEndpoint = domain + 'chat/add';
const editChatRoomEndpoint = domain + 'chat/edit/';
const deleteChatRoomEndpoint = domain + 'chat/delete/';
const undeleteChatRoomEndpoint = domain + 'chat/undelete/';
const deleteChatMessageEndpoint = domain + 'chat/message/';
const chatRoomCache$ = new Subject<boolean>();
const chatMessageCache$ = new Subject<boolean>();
const logout$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {


  constructor(private http: HttpClient, private helperService: HelperService) {
    this.helperService.isUserLogged.subscribe(res => logout$.next(res));
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  getSingle(id: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.get<ServerResponse<ChatRoom>>(getSingleChatRoomsEndpoint + id);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  getAllLinkedChatRooms(roomId: string): Observable<ServerResponse<ChatRoom[]>> {
    return this.http.get<ServerResponse<ChatRoom[]>>(getAllLinkedChatRoomsEndpoint + roomId);
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  getAllChatRoomUsers(room: ChatRoom): Observable<ChatRoomUsers> {
    let obs = this.getAllLinkedChatRooms(room._id).pipe(
      map(roomsRes => {
        let shares_active = roomsRes.data?.filter(room => !room.inactive);
        let shares_inactive = roomsRes.data?.filter(room => room.inactive);
        return {
          id: room._id,
          roomKey: room.roomKey,
          name: room.name,
          shares: shares_active,
          deletedShares: shares_inactive,
          inactive: room.inactive
        } as ChatRoomUsers
      })
    );
    return obs;
  }

  @HTTPCacheable({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  getAllChatRooms(): Observable<ServerResponse<ChatRoom[]>> {
    return this.http.get<ServerResponse<ChatRoom[]>>(getAllChatRoomsEndpoint);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  addChatRoom(payload: any): Observable<ServerResponse<ChatRoom>> {
    return this.http.post<ServerResponse<ChatRoom>>(addChatRoomEndpoint, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  editChatRoom(roomId: string, payload: any): Observable<ServerResponse<ChatRoom>> {
    return this.http.put<ServerResponse<ChatRoom>>(editChatRoomEndpoint + roomId, payload);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  deleteChatRoom(roomId: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.delete<ServerResponse<ChatRoom>>(deleteChatRoomEndpoint + roomId);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: chatRoomCache$
  })
  undeleteChatRoom(roomId: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.delete<ServerResponse<ChatRoom>>(undeleteChatRoomEndpoint + roomId);
  }

  resetChatMessageCache(){
    chatMessageCache$.next(true);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: chatMessageCache$
  })
  search(query: string): Observable<ServerResponse<ChatMessage[]>> {
    return this.http.get<ServerResponse<ChatMessage[]>>(getChatRoomMessagesEndpoint + query);
  }

  @HTTPCacheBuster({
    logoutEvent: logout$, refresher: chatMessageCache$
  })
  deleteChatMessage(messageId: string): Observable<ServerResponse<ChatMessage>> {
    return this.http.delete<ServerResponse<ChatMessage>>(deleteChatMessageEndpoint + messageId);
  }
}

