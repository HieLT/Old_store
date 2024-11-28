import Conversation from "../models/conversation";
import Message, {IMessage} from "../models/message";

export default async function connectSocket(io: any) {
    let userSockets: any = {};
    try {
        io.on('connection', (socket: any) => {
            console.log(`New connection: ${socket.id}`);

            // Handle user registration and store the socketId under their userId
            let userId: any = socket.handshake.query?.user_id

            userSockets[socket.id] = userId;
            console.log(`User ${userId} connected with socket ID ${socket.id}`);

            const onlineUserIds = Array.from(io.sockets.sockets.keys())

            onlineUserIds.forEach(async (socketId: any) => {
                try {
                    const conversations = await Conversation
                        .find({
                            participants: {
                                $in: [userSockets[socketId]],
                            },
                        })
                        .populate({
                            path: 'participants',
                        }).lean();

                    const result = conversations?.map(item => {
                        return {
                            _id: item._id,
                            participant: item.participants.find((participant) =>
                                participant._id.toString() !== userId
                            )
                        }
                    })
                    io.to(socketId).emit('getConversations', result);
                } catch (err) {
                    socket.emit('err', {error: err});
                }
            })

            socket.on('getMessages', async ({conversationId}: {
                conversationId: string
            }, callback: (messages: IMessage[]) => void) => {
                try {
                    const messages = await Message.find({conversation_id: conversationId});
                    callback(messages);
                } catch (err: any) {
                    console.log('err', err);
                    socket.emit('err', {error: err});
                }
            });

            socket.on('sendMessage', ({senderUserId, recipientUserId, message, conversationId}: {
                senderUserId: string,
                recipientUserId: string,
                message: string,
                conversationId: string
            }) => {
                const recipientSocketIds = Object.keys(userSockets)?.filter((key) => userSockets[key] === recipientUserId);

                Message.create({
                    conversation_id: conversationId,
                    sender_id: senderUserId,
                    content: message,
                });

                if (recipientSocketIds) {
                    recipientSocketIds.forEach((recipientSocketId: any) => {
                        io.to(recipientSocketId).emit('receiveMessage', {
                            senderUserId,
                            message,
                        });
                    });
                } else {
                    console.log(`User ${recipientUserId} is not connected.`);
                }
            });

            // Handle user disconnection
            socket.on('disconnect', () => {
                // Remove the socketId from userSockets when they disconnect
                delete userSockets[socket.id];
                console.log(`Socket ${socket.id} disconnected`);
            });
        });
    } catch (err: any) {
        console.log(err.message);
    }
}
