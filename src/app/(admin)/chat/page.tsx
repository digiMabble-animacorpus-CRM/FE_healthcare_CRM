'use client';

import PageTitle from '@/components/PageTitle';
import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, Row } from 'react-bootstrap';

type ApiChatItem = {
  session_id: string;
  email: string;
  message_type: 'human' | 'ai';
  message_content: string;
  created_at: string;
};

type GroupedChats = {
  [session_id: string]: {
    email: string;
    createdAt: string;
    messages: { type: 'human' | 'ai'; content: string }[];
  };
};

const ITEMS_PER_PAGE = 9;

const ChatHistory: React.FC = () => {
  const [chats, setChats] = useState<GroupedChats>({});
  const [filteredChats, setFilteredChats] = useState<GroupedChats>({});
  const [loading, setLoading] = useState(true);

  const [filterDate, setFilterDate] = useState('');
  const [filterEmail, setFilterEmail] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const chatBoxRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const res = await axios.get(`${API_BASE_PATH}/chat-bot-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const grouped: GroupedChats = {};
        for (const item of res.data as ApiChatItem[]) {
          const sid = item.session_id;
          if (!grouped[sid]) {
            grouped[sid] = {
              email: item.email,
              createdAt: item.created_at,
              messages: [],
            };
          }

          grouped[sid].messages.push({
            type: item.message_type,
            content: item.message_content,
          });
        }

        setChats(grouped);
        setFilteredChats(grouped);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    Object.keys(chatBoxRefs.current).forEach((sid) => {
      const box = chatBoxRefs.current[sid];
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    });
  }, [filteredChats]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();

    let filtered: GroupedChats = {};
    Object.entries(chats).forEach(([sid, chatData]) => {
      const chatDate = chatData.createdAt?.slice(0, 10) ?? '';

      const matchDate = !filterDate || chatDate === filterDate;
      const matchEmail =
        !filterEmail || chatData.email.toLowerCase().includes(filterEmail.toLowerCase());

      if (matchDate && matchEmail) {
        filtered[sid] = chatData;
      }
    });

    setFilteredChats(filtered);
    setCurrentPage(1);
  };

  if (loading) return <div>Loading chat history...</div>;

  const chatEntries = Object.entries(filteredChats);
  const totalPages = Math.ceil(chatEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentChats = chatEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <PageTitle title="Historique des discussions" subName="Chat" />
      <Card>
        {/* Filters */}
        <CardHeader>
          <Form onSubmit={handleFilter}>
            <Row className="g-2">
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par identifiant de messagerie utilisateur"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </Col>
              <Col md={3} className="d-flex">
                <Button type="submit" variant="primary" className="w-100">
                  Recherche
                </Button>
              </Col>
            </Row>
          </Form>
        </CardHeader>

        <CardBody>
          <Row>
            {currentChats.length > 0 ? (
              currentChats.map(([sid, chatData]) => (
                <Col md={4} key={sid} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <CardHeader className="bg-light">
                      <strong>Identifiant de messagerie de l utilisateur: {chatData.email}</strong>
                      <div className="text-muted small">Date: {formatDate(chatData.createdAt)}</div>
                    </CardHeader>
                    <CardBody className="p-3">
                      <div
                        className="chat-box"
                        ref={(el) => {
                          chatBoxRefs.current[sid] = el;
                        }}
                      >
                        {chatData.messages.length > 0 ? (
                          chatData.messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.type}`}>
                              <div className="bubble">{msg.content}</div>
                            </div>
                          ))
                        ) : (
                          <div className="message empty">No messages</div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <div className="alert alert-warning text-center mb-0">No chats found</div>
              </Col>
            )}
          </Row>
        </CardBody>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter>
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <Button
                  variant="link"
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Précédent
                </Button>
              </li>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <Button
                  variant="link"
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Suivant
                </Button>
              </li>
            </ul>
          </CardFooter>
        )}
      </Card>

      <style jsx>{`
        .chat-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 5px;
        }
        .chat-message {
          display: flex;
          width: 100%;
        }
        .chat-message.human {
          justify-content: flex-start;
        }
        .chat-message.ai {
          justify-content: flex-end;
        }
        .bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }
        .chat-message.human .bubble {
          background-color: #d1e7dd;
          color: #0f5132;
          border-bottom-left-radius: 0;
        }
        .chat-message.ai .bubble {
          background-color: #f9f5ff; /* Updated AI message color */
          color: #333;
          border-bottom-right-radius: 0;
        }
        .message.empty {
          text-align: center;
          background: #f8d7da;
          color: #842029;
          padding: 8px;
          border-radius: 6px;
        }
      `}</style>
    </>
  );
};

export default ChatHistory;
