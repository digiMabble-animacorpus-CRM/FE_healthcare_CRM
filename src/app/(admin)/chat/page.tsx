'use client';

import React, { useEffect, useRef, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Form,
  Row,
  Spinner,
  Placeholder,
} from 'react-bootstrap';
import { useNotificationContext } from '@/context/useNotificationContext';

type ApiChatItem = {
  session_id: string;
  email: string | null;
  created_at?: string;
  message_type?: 'human' | 'ai';
  message_content:
    | string
    | {
        type: 'human' | 'ai';
        content: string;
        [key: string]: any;
      };
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
  const { showNotification } = useNotificationContext();

  const [chats, setChats] = useState<GroupedChats>({});
  const [filteredChats, setFilteredChats] = useState<GroupedChats>({});
  const [loading, setLoading] = useState(true);

  // replaced single filterDate with range
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(''); // YYYY-MM-DD
  const [filterEmail, setFilterEmail] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const chatBoxRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.slice(0, 10).split('-');
    return `${day}-${month}-${year}`;
  };

  const buildGrouped = (data: ApiChatItem[]) => {
    const grouped: GroupedChats = {};
    for (const item of data) {
      const sid = item.session_id;
      if (!grouped[sid]) {
        grouped[sid] = {
          email: item.email || 'N/A',
          createdAt: item.created_at || new Date().toISOString(),
          messages: [],
        };
      }

      const type =
        item.message_type ||
        (typeof item.message_content === 'object' && item.message_content?.type) ||
        'human';

      const content =
        (typeof item.message_content === 'string'
          ? item.message_content
          : item.message_content?.content) || '';

      grouped[sid].messages.push({ type, content });
    }
    return grouped;
  };

  const fetchChats = async (opts?: { start_date?: string; end_date?: string; email?: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const params: Record<string, string> = {};
      if (opts?.start_date) params.start_date = opts.start_date;
      if (opts?.end_date) params.end_date = opts.end_date;
      if (opts?.email) params.email = opts.email;

      const res = await axios.get(`${API_BASE_PATH}/chat-bot-history`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const grouped = buildGrouped(res.data as ApiChatItem[]);
      setChats(grouped);
      setFilteredChats(grouped);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setChats({});
      setFilteredChats({});
      showNotification({
        message: 'Error fetching chat history',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // scroll each chat box to bottom when filteredChats change
    Object.keys(chatBoxRefs.current).forEach((sid) => {
      const box = chatBoxRefs.current[sid];
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    });
  }, [filteredChats]);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();

    // both startDate and endDate are required when attempting a date range filter
    const startProvided = !!startDate;
    const endProvided = !!endDate;

    if (startProvided !== endProvided) {
      // one provided but not the other -> notify and stop
      showNotification({
        message: 'Please enter both Start date and End date.',
        variant: 'danger',
      });
      return;
    }

    if (startProvided && endProvided && startDate > endDate) {
      showNotification({
        message: 'Start date cannot be after end date.',
        variant: 'danger',
      });
      return;
    }

    // if both dates provided or none provided, proceed.
    // prefer server-side filtering: call backend with provided params
    await fetchChats({
      start_date: startProvided ? startDate : undefined,
      end_date: endProvided ? endDate : undefined,
      email: filterEmail || undefined,
    });

    // keep a local filtered view (by email) for quick UI feedback if needed
    const filtered: GroupedChats = {};
    Object.entries(chats).forEach(([sid, chatData]) => {
      const matchEmail =
        !filterEmail || chatData.email.toLowerCase().includes(filterEmail.toLowerCase());
      if (matchEmail) {
        filtered[sid] = chatData;
      }
    });

    setFilteredChats(filtered);
    setCurrentPage(1);
  };

  const handleClear = async () => {
    setStartDate('');
    setEndDate('');
    setFilterEmail('');
    await fetchChats();
  };

  if (loading)
    return (
      <>
        <PageTitle title="Historique des discussions" subName="Chat" />
        <Card>
          <CardBody>
            <div className="d-flex flex-column align-items-center justify-content-center py-4">
              <Spinner animation="border" role="status" className="mb-3" />
              <div className="mb-3 text-muted">Chargement de l'historique des discussions...</div>

              <Row className="w-100">
                {[0, 1, 2].map((i) => (
                  <Col md={4} key={i} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <CardHeader className="bg-light">
                        <Placeholder as="p" animation="glow" className="mb-1">
                          <Placeholder xs={8} />
                        </Placeholder>
                        <div className="text-muted small">
                          <Placeholder as="span" animation="glow">
                            <Placeholder xs={4} />
                          </Placeholder>
                        </div>
                      </CardHeader>
                      <CardBody className="p-3">
                        <div className="chat-box">
                          {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="chat-message human">
                              <div className="bubble">
                                <Placeholder as="span" animation="glow">
                                  <Placeholder xs={10} />
                                </Placeholder>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </CardBody>
        </Card>

        <style jsx>{`
          .chat-box {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 300px;
            overflow: hidden;
            padding-right: 5px;
          }
          .chat-message {
            display: flex;
            width: 100%;
          }
          .bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
            background-color: #f0f0f0;
          }
        `}</style>
      </>
    );

  const chatEntries = Object.entries(filteredChats);
  const totalPages = Math.max(1, Math.ceil(chatEntries.length / ITEMS_PER_PAGE));
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
        <CardHeader>
          <Form onSubmit={handleFilter}>
            <Row className="g-2">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par identifiant de messagerie utilisateur"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                />
              </Col>

              {/* two date inputs for range */}
              <Col md={2}>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="start date (YYYY-MM-DD)"
                  placeholder="Start Date"
                />
              </Col>

              <Col md={2}>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label="end date (YYYY-MM-DD)"
                  placeholder="End Date"
                />
              </Col>

              <Col md={4} className="d-flex">
                <div className="d-flex w-100 gap-1">
                  <Button type="submit" variant="primary" className="flex-grow-1">
                    Recherche
                  </Button>

                </div>
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
                      <strong>Identifiant de messagerie de l'utilisateur: {chatData.email}</strong>
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
          background-color: #f9f5ff;
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
