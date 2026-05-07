import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
};

const chipStyle = (type) => {
  const map = {
    high: { background: "rgba(239,68,68,0.12)", color: "#FCA5A5" },
    medium: { background: "rgba(251,191,36,0.12)", color: "#FDE68A" },
    low: { background: "rgba(16,185,129,0.12)", color: "#6EE7B7" },
    in_progress: { background: "rgba(79,70,229,0.18)", color: "#A5B4FC" },
    todo: {
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.28)",
    },
    done: { background: "rgba(16,185,129,0.12)", color: "#6EE7B7" },
    overdue: { background: "rgba(239,68,68,0.12)", color: "#FCA5A5" },
  };
  return {
    fontSize: "10.5px",
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: "20px",
    ...(map[type] || map.todo),
  };
};

const pillStyle = (v) => {
  const map = {
    up: { background: "rgba(16,185,129,0.15)", color: "#34D399" },
    down: { background: "rgba(239,68,68,0.15)", color: "#F87171" },
    blue: { background: "rgba(56,189,248,0.15)", color: "#38BDF8" },
  };
  return {
    fontSize: "10px",
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: "20px",
    ...map[v],
  };
};

const badgeStyle = (role) =>
  role === "admin"
    ? {
        fontSize: "10px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "20px",
        background: "rgba(79,70,229,0.2)",
        color: "#A5B4FC",
        border: "1px solid rgba(79,70,229,0.3)",
      }
    : {
        fontSize: "10px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.28)",
      };

const initials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await API.get("/tasks/dashboard/stats");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <Layout>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Topbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 28px",
            borderBottom: "1px solid rgba(79,70,229,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#F0F4FF",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Good {greeting()},{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#A5B4FC,#38BDF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {firstName}
            </span>{" "}
            👋
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </button>
            <button
              onClick={() => navigate("/projects")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 18px",
                background: "linear-gradient(135deg,#4F46E5,#38BDF8)",
                borderRadius: "10px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Task
            </button>
          </div>
        </div>

        <div style={{ padding: "0 28px 28px" }}>
          {loading ? (
            <div className="spinner" />
          ) : (
            <>
              {/* Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                {[
                  {
                    glow: "rgba(79,70,229,0.6)",
                    iconBg: "rgba(79,70,229,0.18)",
                    iconStroke: "#A5B4FC",
                    pill: ["All tasks", "blue"],
                    val: data.stats.total,
                    lbl: "Total Tasks",
                    icon: (
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    ),
                  },
                  {
                    glow: "rgba(56,189,248,0.5)",
                    iconBg: "rgba(56,189,248,0.18)",
                    iconStroke: "#38BDF8",
                    pill: ["Active", "blue"],
                    val: data.stats.in_progress,
                    lbl: "In Progress",
                    icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
                  },
                  {
                    glow: "rgba(16,185,129,0.5)",
                    iconBg: "rgba(16,185,129,0.15)",
                    iconStroke: "#34D399",
                    pill: ["Done", "up"],
                    val: data.stats.done,
                    lbl: "Completed",
                    icon: (
                      <>
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <path d="M22 4L12 14.01l-3-3" />
                      </>
                    ),
                  },
                  {
                    glow: "rgba(239,68,68,0.5)",
                    iconBg: "rgba(239,68,68,0.15)",
                    iconStroke: "#F87171",
                    pill: ["Urgent", "down"],
                    val: data.stats.overdue,
                    lbl: "Overdue",
                    icon: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </>
                    ),
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "linear-gradient(145deg,#131929,#0F1520)",
                      border: "1px solid rgba(79,70,229,0.1)",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition:
                        "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.05) translateY(-3px)";
                      e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.borderColor = "rgba(79,70,229,0.1)";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        right: "-30px",
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        opacity: 0.45,
                        background: `radial-gradient(circle,${s.glow},transparent)`,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: s.iconBg,
                        }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={s.iconStroke}
                          strokeWidth="2"
                        >
                          {s.icon}
                        </svg>
                      </div>
                      <span style={pillStyle(s.pill[1])}>{s.pill[0]}</span>
                    </div>
                    <div
                      style={{
                        fontSize: "30px",
                        fontWeight: 700,
                        letterSpacing: "-1.5px",
                        color: "#F0F4FF",
                        lineHeight: 1,
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.28)",
                        marginTop: "4px",
                      }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 300px",
                  gap: "14px",
                }}
              >
                {/* My Tasks */}
                <div
                  style={{
                    background: "linear-gradient(145deg,#131929,#0F1520)",
                    border: "1px solid rgba(79,70,229,0.1)",
                    borderRadius: "18px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(79,70,229,0.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      My Tasks
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(165,180,252,0.8)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/projects")}
                    >
                      View all →
                    </div>
                  </div>

                  {data.tasks.length === 0 ? (
                    <div
                      style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "13px",
                      }}
                    >
                      No tasks yet. Join a project to get started!
                    </div>
                  ) : (
                    data.tasks.slice(0, 6).map((task, i, arr) => {
                      const isOverdue =
                        task.due_date &&
                        new Date(task.due_date) < new Date() &&
                        task.status !== "done";
                      const isDone = task.status === "done";
                      const dueDate = task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : null;
                      return (
                        <div
                          key={task.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 20px",
                            borderBottom:
                              i < arr.length - 1
                                ? "1px solid rgba(79,70,229,0.05)"
                                : "none",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(79,70,229,0.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div
                            style={
                              isDone
                                ? {
                                    width: "17px",
                                    height: "17px",
                                    borderRadius: "5px",
                                    background:
                                      "linear-gradient(135deg,#4F46E5,#38BDF8)",
                                    border: "none",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 0 10px rgba(79,70,229,0.45)",
                                  }
                                : {
                                    width: "17px",
                                    height: "17px",
                                    borderRadius: "5px",
                                    border:
                                      "1.5px solid rgba(255,255,255,0.12)",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }
                            }
                          >
                            {isDone && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 500,
                                color: isDone
                                  ? "rgba(255,255,255,0.22)"
                                  : "#D0D8F0",
                                textDecoration: isDone
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {task.title}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "4px",
                              }}
                            >
                              <span style={chipStyle(task.priority)}>
                                {task.priority}
                              </span>
                              {isOverdue ? (
                                <span style={chipStyle("overdue")}>
                                  Overdue
                                </span>
                              ) : (
                                <span style={chipStyle(task.status)}>
                                  {task.status === "in_progress"
                                    ? "In Progress"
                                    : task.status === "done"
                                      ? "Done"
                                      : "Todo"}
                                </span>
                              )}
                            </div>
                          </div>
                          {dueDate && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.2)",
                                flexShrink: 0,
                              }}
                            >
                              {dueDate}
                            </div>
                          )}
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg,#4F46E5,#38BDF8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "9px",
                              fontWeight: 700,
                              color: "#fff",
                              flexShrink: 0,
                              boxShadow: "0 0 8px rgba(79,70,229,0.35)",
                            }}
                          >
                            {initials(user?.name)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Projects */}
                <div
                  style={{
                    background: "linear-gradient(145deg,#131929,#0F1520)",
                    border: "1px solid rgba(79,70,229,0.1)",
                    borderRadius: "18px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(79,70,229,0.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      Projects
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(165,180,252,0.8)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/projects")}
                    >
                      New +
                    </div>
                  </div>
                  <div style={{ padding: "12px 16px" }}>
                    {!data.projects || data.projects.length === 0 ? (
                      <div
                        style={{
                          padding: "30px 20px",
                          textAlign: "center",
                          color: "rgba(255,255,255,0.3)",
                          fontSize: "13px",
                        }}
                      >
                        No projects yet.
                      </div>
                    ) : (
                      data.projects.slice(0, 4).map((proj, i, arr) => {
                        const pct =
                          proj.total_tasks > 0
                            ? Math.round(
                                (proj.done_tasks / proj.total_tasks) * 100,
                              )
                            : 0;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => navigate(`/projects/${proj.id}`)}
                            style={{
                              background: "rgba(79,70,229,0.06)",
                              border: "1px solid rgba(79,70,229,0.1)",
                              borderRadius: "14px",
                              padding: "14px",
                              marginBottom: i < arr.length - 1 ? "10px" : 0,
                              cursor: "pointer",
                              transition: "transform 0.2s, border-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.03)";
                              e.currentTarget.style.borderColor =
                                "rgba(79,70,229,0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.borderColor =
                                "rgba(79,70,229,0.1)";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "13.5px",
                                  fontWeight: 600,
                                  color: "#D0D8F0",
                                }}
                              >
                                {proj.name}
                              </div>
                              <span style={badgeStyle(proj.role)}>
                                {proj.role}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "3px",
                                background: "rgba(255,255,255,0.06)",
                                borderRadius: "10px",
                                marginBottom: "8px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: "10px",
                                  background:
                                    "linear-gradient(90deg,#4F46E5,#38BDF8)",
                                  width: `${pct}%`,
                                }}
                              />
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "rgba(255,255,255,0.22)",
                                }}
                              >
                                {proj.total_tasks} tasks · {proj.member_count}{" "}
                                members
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "rgba(165,180,252,0.7)",
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
