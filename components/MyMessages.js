// src/pages/MyMessages.js
import React, { useEffect, useState } from 'react';
import { List, Avatar, Badge, Typography, Spin } from 'antd';
import { db, auth } from '../firebase';
import {
  collection,
  query, 
  getDocs,
  doc, 
  onSnapshot,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const MyMessages = () => {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUser(currentUser);

      const q = query(collection(db, 'chats'));
      const snapshot = await getDocs(q);

      const userChats = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (chat) =>
            chat.creatorId === currentUser.uid ||
            chat.employeeId === currentUser.uid
        );

      setChats(userChats);
      setLoading(false);
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribes = chats.map((chat) => {
      const chatRef = doc(db, 'chats', chat.id);
      return onSnapshot(chatRef, (snap) => {
        const data = snap.data();
        if (data) {
          setChats((prev) =>
            prev.map((c) => (c.id === chat.id ? { ...c, ...data } : c))
          );
        }
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, chats]);

  const getOtherUserId = (chat) =>
    chat.creatorId === user.uid ? chat.employeeId : chat.creatorId;

  const openChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  if (loading) return <Spin fullscreen />;

  return (
    <div style={{ padding: '24px' }}>
      <h2>My Messages</h2>
      <List
        itemLayout="horizontal"
        dataSource={chats}
        renderItem={(chat) => {
          const lastMsg =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1]
              : null;

          const isUnread =
            lastMsg &&
            lastMsg.senderId !== user.uid &&
            lastMsg.read === false;

          return (
            <List.Item onClick={() => openChat(chat.id)} style={{ cursor: 'pointer' }}>
              <List.Item.Meta
                avatar={
                  <Badge dot={isUnread}>
                    <Avatar style={{ backgroundColor: '#1890ff' }}>
                      {getOtherUserId(chat)?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                  </Badge>
                }
                title={
                  <>
                    <Text strong>{chat.jobId || 'Unknown Job'}</Text>
                    <br />
                    <Text type="secondary">
                      {getOtherUserId(chat).slice(0, 6)}...
                    </Text>
                  </>
                }
                description={lastMsg ? lastMsg.text : 'No messages yet'}
              />
              {lastMsg && (
                <div style={{ minWidth: 100, textAlign: 'right' }}>
                  <Text type="secondary">
                    {lastMsg.timestamp?.toDate?.().toLocaleTimeString() || ''}
                  </Text>
                </div>
              )}
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default MyMessages;
