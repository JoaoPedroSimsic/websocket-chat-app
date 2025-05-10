import React, { useEffect, useState, useCallback } from 'react';
import { getRoomById, addUserToRoom, removeUserFromRoom } from '../api/roomApi';
import handleError from '../utils/handleError';

interface RoomDetailData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  members: { id: number; username: string }[];
  messages: {
    id: number;
    content: string;
    createdAt: string;
    sender: { username: string };
  }[];
}

interface RoomDetailProps {
  roomId: number;
  onBackToList: () => void;
  currentUserId: number;
}

const RoomDetail: React.FC<RoomDetailProps> = ({
    roomId,
    onBackToList,
    currentUserId,
}) => {
    const [room, setRoom] = useState<RoomDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRoomDetails = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getRoomById(roomId);
            setRoom(data);
            setIsMember(
                data?.members.some((member: { id: number; username: string }) => member.id === currentUserId) || false,
            );
        } catch (err: unknown) {
            handleError(err, setError);
        } finally {
            setLoading(false);
        }
    }, [roomId, currentUserId]);

    useEffect(() => {
        fetchRoomDetails();
    }, [fetchRoomDetails]);

    const handleJoinRoom = async () => {
        setActionLoading(true);
        setError(null);

        try {
            await addUserToRoom(roomId);
            fetchRoomDetails();
        } catch (err: unknown) {
            handleError(err, setError);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveRoom = async () => {
        setActionLoading(true);
        setError(null);

        try {
            await removeUserFromRoom(roomId, currentUserId);
            fetchRoomDetails();
        } catch (err: unknown) {
            handleError(err, setError);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center text-gray-600">Loading room details...</div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    if (!room) {
        return <div className="text-center text-gray-500">Room not found</div>;
    }

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <button
                className="text-blue-500 hover:underline mb-4"
                onClick={onBackToList}
            >
                &larr; Back to rooms
            </button>
            <h2 className="text-2x1 font-bold text-center text-gray-800">
                {room.name}
            </h2>

            <div className="flex justify-center space-x-4">
                {isMember ? (
                    <button
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                        onClick={handleLeaveRoom}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Leaving...' : 'Leave Room'}
                    </button>
                ) : (
                    <button
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                        onClick={handleJoinRoom}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Joining...' : 'Join Room'}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-center text-red-500 text-sm mt-2">{error}</p>
            )}

            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Members:</h3>
                {room.members.length === 0 ? (
                    <p className="text-gray-500">No members yet</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {room.members.map((member, index) => {
                            return (
                                <li key={index} className="text-gray-700">
                                    {member.username}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Messages:</h3>
                {room.messages.length === 0 ? (
                    <p className="text-gray-500">No messages yet</p>
                ) : (
                    <ul className='space-y-2'>
                        {room.messages.map((message) => (
                            <li key={message.id} className='p-2 bg-gray-100 rounded-md'>
                                <span className='font-semibold text-gray-700'>{message.sender.username}</span>{' '}
                                <span className='text-gray-600'>{message.content}</span>
                                <span className='block text-xs text-gray-500 text-right'>{new Date(message.createdAt).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RoomDetail;
