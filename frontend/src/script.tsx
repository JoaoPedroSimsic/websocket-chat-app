import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// --- Socket.IO Client Service (Adapted for React) ---
// This section contains the socket connection logic, adapted to be used within React.
// We'll manage the socket instance and event listeners here.

// Define a type alias for the Socket instance type.
// This is a workaround if 'import type { Socket }' doesn't let you use 'Socket' directly as a type.
type SocketInstance = typeof Socket;

// Define the structure of a chat message as received from the server
interface ChatMessage {
    id: number;
    userId: number;
    username: string;
    roomId: number;
    content: string;
    timestamp: string; // Or Date
    sequence: number;
    createdAt: string; // Or Date
}

// Define the structure of the acknowledgement response for sending a message
interface SendMessageAckResponse {
    success: boolean;
    message?: ChatMessage;
    error?: string;
}

// Define the structure of the message data sent to the server
interface SendMessageData {
    roomId: number;
    content: string;
}

// Define your backend URL. Hardcoding for simplicity as requested.
// In a real application, use environment variables for flexibility.
const BACKEND_URL: string = 'http://localhost:3000'; // Hardcoded backend URL

// REMOVED: Duplicate declaration of socketRef outside the hook.
// Use a ref to hold the socket instance across renders
// const socketRef = useRef<SocketInstance | null>(null);


// Custom hook to manage socket connection and listeners
const useSocket = (authToken: string | null) => {
    // *** IMPORTANT: React Hooks must be called at the top level of functional components or custom hooks. ***
    // *** The error "g.current is null" from useRef is unusual and often indicates an environment issue, ***
    // *** such as mismatched React versions or build configuration problems, if the hook is called correctly. ***
    // This is the correct declaration of socketRef inside the hook.
    const socketRef = useRef<SocketInstance | null>(null);

    const [isConnected, setIsConnected] = useState(false); // useState is at the top level
    const [messages, setMessages] = useState<ChatMessage[]>([]); // useState is at the top level
    const [error, setError] = useState<string | null>(null); // useState is at the top level

    useEffect(() => { // useEffect is at the top level
        // Only connect if we have an auth token and the socket is not already initialized/connected
        if (authToken && !socketRef.current) {
            console.log('Attempting to connect socket...');
            socketRef.current = io(BACKEND_URL, {
				auth: {
					token: authToken,
				}
			});

            // --- Set up Event Listeners ---
            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
                setIsConnected(true);
                setError(null); // Clear any previous errors
            });

            socketRef.current.on('disconnect', (reason: string) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
                // Optionally set an error or status message based on reason
                setError(`Disconnected: ${reason}`);
            });

            socketRef.current.on('connect_error', (err: Error) => {
                console.error('Socket connection error:', err.message);
                setIsConnected(false);
                setError(`Connection Error: ${err.message}`);
            });

            // Listen for incoming chat messages
            socketRef.current.on('chat:message', (message: ChatMessage) => {
                console.log('Received message:', message);
                // Update the messages state with the new message
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            // Listen for chat history when joining a room
            socketRef.current.on('chat:history', (historyMessages: ChatMessage[]) => {
                console.log('Received chat history:', historyMessages);
                // Replace current messages with history
                setMessages(historyMessages);
            });

            // Listen for server-side errors related to chat/rooms
            socketRef.current.on('error:room:join', (errorMessage: string) => {
                console.error('Server error joining room:', errorMessage);
                setError(`Error joining room: ${errorMessage}`);
            });

            socketRef.current.on('error:chat:message', (errorMessage: string) => {
                console.error('Server error sending message:', errorMessage);
                setError(`Error sending message: ${errorMessage}`);
            });

            // Add other listeners here as needed (e.g., user typing, room updates)

        } else if (!authToken && socketRef.current && socketRef.current.connected) {
            // If auth token is removed but socket is connected, disconnect
            console.log('Auth token removed, disconnecting socket...');
            socketRef.current.disconnect();
            // Don't set socketRef.current to null here, let the cleanup handle it
            setIsConnected(false);
            setMessages([]); // Clear messages on disconnect
            setError(null);
        }

        // --- Cleanup function ---
        return () => {
            // Disconnect the socket when the component unmounts or auth token changes
            if (socketRef.current) {
                console.log('Cleaning up socket listeners and disconnecting...');
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
                socketRef.current.off('connect_error');
                socketRef.current.off('chat:message');
                socketRef.current.off('chat:history');
                socketRef.current.off('error:room:join');
                socketRef.current.off('error:chat:message');
                // Remove other listeners here
                socketRef.current.disconnect();
                socketRef.current = null; // Clear the ref explicitly in cleanup
            }
        };
    }, [authToken]); // Re-run effect when authToken changes

    // Helper function to emit 'room:join'
    const joinRoom = (roomId: number) => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('Emitting room:join', roomId);
            socketRef.current.emit('room:join', roomId);
            setMessages([]); // Clear messages when attempting to join a new room
            setError(null); // Clear previous errors
        } else {
            console.warn('Cannot join room: Socket not connected.');
            setError('Cannot join room: Socket not connected.');
        }
    };

    // Helper function to emit 'room:leave'
    const leaveRoom = (roomId: number) => {
         if (socketRef.current && socketRef.current.connected) {
            console.log('Emitting room:leave', roomId);
            socketRef.current.emit('room:leave', roomId);
            setMessages([]); // Clear messages when leaving a room
            setError(null); // Clear previous errors
             // You might want to update UI to indicate leaving
        } else {
            console.warn('Cannot leave room: Socket not connected.');
             setError('Cannot leave room: Socket not connected.');
        }
    };


    // Helper function to emit 'chat:message' with acknowledgement
    const sendChatMessage = (messageData: SendMessageData) => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('Emitting chat:message', messageData);
            // Emit the event with the message data and the acknowledgement callback
            socketRef.current.emit('chat:message', messageData, (response: SendMessageAckResponse) => {
                if (response.success) {
                    console.log('Message sent successfully acknowledged:', response.message);
                    // The message will be added to state when the server broadcasts it back
                } else {
                    console.error('Server failed to process message:', response.error);
                    setError(`Failed to send message: ${response.error}`);
                }
            });
        } else {
            console.warn('Cannot send message: Socket not connected.');
            setError('Cannot send message: Socket not connected.');
        }
    };

    // Helper function to disconnect the socket
    const disconnectSocket = () => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('Disconnecting socket...');
            socketRef.current.disconnect();
            socketRef.current = null; // Clear the ref
            setIsConnected(false);
            setMessages([]); // Clear messages
            setError(null);
        }
    };


    return {
        socket: socketRef.current, // Expose the socket instance if needed
        isConnected,
        messages,
        error,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        disconnectSocket,
    };
};

// --- Main App Component ---
// This component will handle authentication state and render the chat interface

function Main() {
    // In a real app, authToken would come from a login process (API call to your /token endpoint)
    // For this example, we'll use a state variable that you can manually set.
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [inputToken, setInputToken] = useState<string>(''); // State for the token input field

    // *** IMPORTANT: Call custom hooks unconditionally at the top level of your functional component. ***
    // *** The useSocket hook is called here at the top level, which is the correct pattern. ***
    const { isConnected, messages, error, joinRoom, leaveRoom, sendChatMessage, disconnectSocket } = useSocket(authToken);

    const [roomIdInput, setRoomIdInput] = useState('');
    const [messageInput, setMessageInput] = useState('');

    // Handle connecting using the token from the input field
    const handleConnect = () => {
        if (inputToken) {
            setAuthToken(inputToken); // Set the auth token to trigger socket connection
        } else {
            alert('Please enter an Auth Token.');
        }
    };

    // Handle disconnecting
    const handleDisconnect = () => {
        setAuthToken(null); // Clear the auth token to trigger socket disconnection
        disconnectSocket(); // Explicitly call disconnect
        setInputToken(''); // Clear the input field
    };

    // Handle joining a room
    const handleJoinRoom = () => {
        if (roomIdInput && isConnected) {
            joinRoom(Number(roomIdInput));
        } else if (!isConnected) {
            alert('Please connect to the server first.');
        } else {
            alert('Please enter a Room ID.');
        }
    };

    // Handle leaving a room
     const handleLeaveRoom = () => {
        if (roomIdInput && isConnected) {
            leaveRoom(Number(roomIdInput));
        } else if (!isConnected) {
            alert('Please connect to the server first.');
        } else {
            alert('Please enter a Room ID.');
        }
    };


    // Handle sending a message
    const handleSendMessage = () => {
        if (messageInput.trim() && roomIdInput && isConnected) {
            sendChatMessage({ roomId: Number(roomIdInput), content: messageInput.trim() });
            setMessageInput(''); // Clear the message input field
        } else if (!isConnected) {
            alert('Please connect to the server first.');
        } else if (!roomIdInput) {
            alert('Please enter a Room ID.');
        } else if (!messageInput.trim()) {
             alert('Please enter a message.');
        }
    };

     // Allow sending message on Enter key press in the input field
    const handleMessageInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            handleSendMessage(); // Trigger the send message function
        }
    };


    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">React Chat</h1>

                {/* Connection Status */}
                <div className="text-center mb-4 text-sm text-gray-600">
                    Status: <span className={`font-semibold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="text-center mb-4 text-sm text-red-600 font-semibold">
                        Error: {error}
                    </div>
                )}


                {/* Connection and Room Controls */}
                <div className="space-y-4 mb-6">
                    <input
                        type="text"
                        placeholder="Enter Auth Token"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                        disabled={isConnected} // Disable input when connected
                    />
                    {!isConnected ? (
                         <button
                            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                            onClick={handleConnect}
                        >
                            Connect
                        </button>
                    ) : (
                         <button
                            className="w-full bg-red-600 text-white p-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
                            onClick={handleDisconnect}
                        >
                            Disconnect
                        </button>
                    )}


                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.target.value)}
                        disabled={!isConnected} // Disable input when not connected
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleJoinRoom}
                            disabled={!isConnected || !roomIdInput} // Disable if not connected or no room ID
                        >
                            Join Room
                        </button>
                        <button
                            className="w-full bg-yellow-600 text-white p-3 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleLeaveRoom}
                            disabled={!isConnected || !roomIdInput} // Disable if not connected or no room ID
                        >
                            Leave Room
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="border border-gray-300 rounded-md p-4 h-64 overflow-y-auto mb-4 bg-gray-50 text-sm flex flex-col space-y-2">
                    {messages.length === 0 && !error && (
                         <div className="text-center text-gray-500">Join a room to start chatting.</div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className="flex flex-col"> {/* Use message ID as key if available */}
                            <span className="font-semibold text-gray-800">{msg.username}</span>
                            <span className="text-gray-700">{msg.content}</span>
                            <span className="text-gray-500 text-xs self-end">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                     {/* Display system messages or errors within the chat area if needed */}
                     {/* Example: if you wanted system messages like "User joined/left" */}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleMessageInputKeyPress}
                        disabled={!isConnected || !roomIdInput} // Disable if not connected or no room ID
                    />
                    <button
                        className="bg-purple-600 text-white p-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSendMessage}
                        disabled={!isConnected || !roomIdInput || !messageInput.trim()} // Disable if not connected, no room ID, or empty message
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Main;
