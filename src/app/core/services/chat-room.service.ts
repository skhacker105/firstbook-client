import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatRoom, ChatRoomUsers } from '../models/chat.model';
import { ServerResponse } from '../models/server-response.model';
import { User } from '../models/user.model';

const domain = environment.api;
const getAllLinkedChatRoomsEndpoint = domain + 'chat/getAlLinkedChatlRoom/';
const getAllChatRoomsEndpoint = domain + 'chat/getAll';
const getSingleChatRoomsEndpoint = domain + 'chat/getSingle/';
const addChatRoomEndpoint = domain + 'chat/add';
const editChatRoomEndpoint = domain + 'chat/edit/';
const deleteChatRoomEndpoint = domain + 'chat/delete/';
const undeleteChatRoomEndpoint = domain + 'chat/undelete/';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {

  constructor(private http: HttpClient) { }

  getSingle(id: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.get<ServerResponse<ChatRoom>>(getSingleChatRoomsEndpoint + id);
  }

  getAllLinkedChatRooms(roomId: string): Observable<ServerResponse<ChatRoom[]>> {
    return this.http.get<ServerResponse<ChatRoom[]>>(getAllLinkedChatRoomsEndpoint + roomId);
  }

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

  getAllChatRooms(): Observable<ServerResponse<ChatRoom[]>> {
    return this.http.get<ServerResponse<ChatRoom[]>>(getAllChatRoomsEndpoint);
  }

  addChatRoom(payload: any): Observable<ServerResponse<ChatRoom>> {
    return this.http.post<ServerResponse<ChatRoom>>(addChatRoomEndpoint, payload);
  }

  editChatRoom(roomId: string, payload: any): Observable<ServerResponse<ChatRoom>> {
    return this.http.put<ServerResponse<ChatRoom>>(editChatRoomEndpoint + roomId, payload);
  }

  deleteChatRoom(roomId: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.delete<ServerResponse<ChatRoom>>(deleteChatRoomEndpoint + roomId);
  }

  undeleteChatRoom(roomId: string): Observable<ServerResponse<ChatRoom>> {
    return this.http.delete<ServerResponse<ChatRoom>>(undeleteChatRoomEndpoint + roomId);
  }
}
