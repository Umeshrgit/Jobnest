// src/components/ChatBox.js

import React, { useEffect, useState, useRef } from 'react';
import { Input, Button, List, Typography } from 'antd';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../styles/ChatBox.css'; // Add updated CSS here

const { TextArea } = Input;

const ChatBox = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const chatEndRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!chatId || !currentUser?.uid) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(msgs);

      const unreadFromOther = msgs.filter(
        (msg) => msg.senderId !== currentUser.uid && msg.read === false
      );

      for (let msg of unreadFromOther) {
        const msgRef = firestoreDoc(db, 'chats', chatId, 'messages', msg.id);
        await updateDoc(msgRef, { read: true });
      }

      if (unreadFromOther.length > 0) {
        toast.info('New message from job creator!');
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser?.uid]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !chatId) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMsg,
        senderId: currentUser?.uid,
        timestamp: serverTimestamp(),
        read: false,
      });
      setNewMsg('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">Chat</div>

      <div className="chatbox-messages">
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item
              className={`chatbox-message ${
                item.senderId === currentUser?.uid ? 'self' : 'other'
              }`}
            >
              <div>
                <Typography.Text>{item.text}</Typography.Text>
                <div className="chatbox-timestamp">
                  {item.timestamp?.toDate?.().toLocaleTimeString() || ''}
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={chatEndRef}></div>
      </div>

      <div className="chatbox-input">
        <TextArea
          rows={2}
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          placeholder="Type your message..."
        />
        <Button type="primary" onClick={sendMessage} block>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
