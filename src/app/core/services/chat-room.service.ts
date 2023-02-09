import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatMessage, ChatRoom, ChatRoomUsers } from '../models/chat.model';
import { ServerResponse } from '../models/server-response.model';
import { HTTPCacheable, HTTPCacheBuster } from '../decorators/cacheable.decorator';

const domain = environment.api;
const getAllLinkedChatRoomsEndpoint = domain + 'chat/getAlLinkedChatlRoom/';
const getAllChatRoomsEndpoint = domain + 'chat/getAll';
const getSingleChatRoomsEndpoint = domain + 'chat/getSingle/';
const getChatRoomMessagesEndpoint = domain + 'chat/message/';
const addChatRoomEndpoint = domain + 'chat/add';
const editChatRoomEndpoint = domain + 'chat/edit/';
const deleteChatRoomEndpoint = domain + 'chat/delete/';
const undeleteChatRoomEndpoint = domain + 'chat/undelete/';
const chatRoomCache$ = new Subject<boolean>();

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {


  constructor(private http: HttpClient) { }

  @HTTPCacheable({
    refresher: chatRoomCache$
  })
  getSingle(id: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.get<ServerResponse<ChatRoom>>(getSingleChatRoomsEndpoint + id);
  }

  @HTTPCacheable({
    refresher: chatRoomCache$
  })
  getAllLinkedChatRooms(roomId: string): Observable<ServerResponse<ChatRoom[]>> {
    return this.http.get<ServerResponse<ChatRoom[]>>(getAllLinkedChatRoomsEndpoint + roomId);
  }

  @HTTPCacheable({
    refresher: chatRoomCache$
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
    refresher: chatRoomCache$
  })
  getAllChatRooms(): Observable<ServerResponse<ChatRoom[]>> {
    return this.http.get<ServerResponse<ChatRoom[]>>(getAllChatRoomsEndpoint);
  }

  @HTTPCacheBuster({
    refresher: chatRoomCache$
  })
  addChatRoom(payload: any): Observable<ServerResponse<ChatRoom>> {
    return this.http.post<ServerResponse<ChatRoom>>(addChatRoomEndpoint, payload);
  }

  @HTTPCacheBuster({
    refresher: chatRoomCache$
  })
  editChatRoom(roomId: string, payload: any): Observable<ServerResponse<ChatRoom>> {
    return this.http.put<ServerResponse<ChatRoom>>(editChatRoomEndpoint + roomId, payload);
  }

  @HTTPCacheBuster({
    refresher: chatRoomCache$
  })
  deleteChatRoom(roomId: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.delete<ServerResponse<ChatRoom>>(deleteChatRoomEndpoint + roomId);
  }

  @HTTPCacheBuster({
    refresher: chatRoomCache$
  })
  undeleteChatRoom(roomId: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.delete<ServerResponse<ChatRoom>>(undeleteChatRoomEndpoint + roomId);
  }

  search(query: string): Observable<ServerResponse<ChatMessage[]>> {
    return this.http.get<ServerResponse<ChatMessage[]>>(getChatRoomMessagesEndpoint + query);
  }
}

