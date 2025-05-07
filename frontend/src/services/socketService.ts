import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

type SocketInstance = typeof Socket;

interface ChatMessage {
	id: number;
	userId: number;
	username: string;
	roomId: number;
	content: string;
	timestamp: Date;
	sequence: number;
	createdAt: Date;
}

interface SendMessageAckResponse {
	success: boolean;
	message?: ChatMessage;
	error?: string;
}

interface SendMessageData {
	roomId: number;
	content: string;
}

const BACKEND_URL = 'http://localhost:3000';

let socket: SocketInstance | null = null;

export const connectSocket = (authToken: string): SocketInstance => {
	if (socket && socket.connected) {
		console.log('Socket already connected');
		return socket;
	}

	socket = io(BACKEND_URL, {
		auth: {
			token: authToken,
		},
	});

	socket.on('connect', () => {
		console.log('Socket connected:', socket?.id);
	});

	socket.on('disconnect', (reason: string) => {
		console.log('Socket disconnected', reason);
	});
	return socket;
};

export const disconnectSocket = () => {
	if (!socket) {
		console.log('Socket not connected yet')
	}
	return socket;
}

export const joinRoom = (roomId: number): void => {
    if (socket && socket.connected) {
        socket.emit('room:join', roomId);
    } else {
        console.warn('Cannot join room: Socket not connected.');
    }
};

/**
 * Emits a 'chat:message' event to the server with acknowledgement.
 * @param messageData The message data to send (roomId and content).
 * @param callback A function to handle the server's acknowledgement response.
 * Uses SendMessageData and SendMessageAckResponse for type annotations.
 */
export const sendChatMessage = (
    messageData: SendMessageData,
    callback?: (response: SendMessageAckResponse) => void
): void => {
    if (socket && socket.connected) {
        // Emit the event with the message data and the optional callback
        socket.emit('chat:message', messageData, (response: SendMessageAckResponse) => {
            if (callback) {
                callback(response); // Call the provided callback with the server's response
            }
            // Note: If the server doesn't send an acknowledgement, this callback won't be called.
            // Ensure your backend sends an acknowledgement for 'chat:message'.
        });
    } else {
        console.warn('Cannot send message: Socket not connected.');
        if (callback) {
            // If socket is not connected, call the callback with an error response
            callback({ success: false, error: 'Socket not connected' });
        }
    }
};

/**
 * Emits a 'room:leave' event to the server.
 * @param roomId The ID of the room to leave.
 */
export const leaveRoom = (roomId: number): void => {
    if (socket && socket.connected) {
        socket.emit('room:leave', roomId);
    } else {
        console.warn('Cannot leave room: Socket not connected.');
    }
};
