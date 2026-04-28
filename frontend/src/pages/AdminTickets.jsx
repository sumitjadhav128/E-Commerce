import { useEffect, useState } from "react";
import "../css/AdminTickets.css";

const FILTERS = ["All", "Open", "Resolved"];

const TicketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const BotIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [resolving, setResolving] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔥 Fetch tickets
  const fetchTickets = async () => {
    const res = await fetch(`${API_URL}/api/ai/tickets`);
    const data = await res.json();
    console.log(data);
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 🔥 Resolve ticket
  const resolveTicket = async (id) => {
    const token = localStorage.getItem("token");
    setResolving(id);

    const res = await fetch(`${API_URL}/api/ai/tickets/${id}/resolve`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
    });

    const data = await res.json();
    console.log(data);
    setResolving(null);
    fetchTickets();
  };

  // 🔥 Filter logic
  const filteredTickets = tickets.filter(ticket => {
    if (filter === "All") return true;
    return ticket.status === filter;
  });

  const counts = {
    All: tickets.length,
    Open: tickets.filter(t => t.status === "Open").length,
    Resolved: tickets.filter(t => t.status === "Resolved").length,
  };

  return (
    <div className="at-page">

      {/* Header */}
      <div className="at-header">
        <div className="at-header-left">
          <div className="at-header-icon">
            <TicketIcon />
          </div>
          <div>
            <h1 className="at-title">Support Tickets</h1>
            <p className="at-subtitle">{counts.Open} open · {counts.Resolved} resolved</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="at-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`at-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="at-filter-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="at-list">
        {filteredTickets.length === 0 ? (
          <div className="at-empty">
            <div className="at-empty-icon"><TicketIcon /></div>
            <p className="at-empty-title">No tickets found</p>
            <p className="at-empty-sub">Nothing in "{filter}" right now.</p>
          </div>
        ) : (
          filteredTickets.map((ticket, i) => (
            <div
              key={ticket._id}
              className={`at-card ${ticket.status === "Resolved" ? "at-card--resolved" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Card header: status badge */}
              <div className="at-card-header">
                <span className={`at-badge ${ticket.status === "Open" ? "badge-open" : "badge-resolved"}`}>
                  {ticket.status === "Resolved" && <CheckIcon />}
                  {ticket.status}
                </span>
                {ticket.createdAt && (
                  <span className="at-card-date">
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                )}
              </div>

              {/* Message */}
              <div className="at-field">
                <div className="at-field-label">
                  <MessageIcon /> User Message
                </div>
                <p className="at-field-value">{ticket.message}</p>
              </div>

              {/* AI Reply */}
              <div className="at-field">
                <div className="at-field-label">
                  <BotIcon /> AI Reply
                </div>
                <p className="at-field-value at-field-value--muted">{ticket.reply}</p>
              </div>

              {/* Resolve Button */}
              {ticket.status === "Open" && (
                <div className="at-card-footer">
                  <button
                    className="at-resolve-btn"
                    onClick={() => resolveTicket(ticket._id)}
                    disabled={resolving === ticket._id}
                  >
                    <CheckIcon />
                    {resolving === ticket._id ? "Resolving…" : "Mark Resolved"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTickets;