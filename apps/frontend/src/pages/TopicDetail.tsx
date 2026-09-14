import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTopic, getTopicStats, Topic, TopicStats } from "../api/topics";
import { QuizList } from "../ui/QuizList";
import { Flashcards } from "../ui/Flashcards";
import { PageLayout } from "../ui/PageLayout";
import { useAuth } from "../context/AuthContext";

export const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TopicStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [t, topicStats] = await Promise.all([
          getTopic(id),
          user?.role === "teacher" ? getTopicStats(id) : Promise.resolve(null),
        ]);
        setTopic(t);
        setStats(topicStats);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.role]);

  if (loading) {
    return <PageLayout title="Téma betöltése"><div className="loading">Betöltés...</div></PageLayout>;
  }
  if (!topic) {
    return <PageLayout title="Téma"><div className="empty-state">Nem található téma.</div></PageLayout>;
  }

  return (
    <PageLayout title={topic.name} subtitle={[topic.subject, topic.grade].filter(Boolean).join(" · ")}>
      <div className="topic-header">
        <div>
          {topic.description && <div className="topic-desc">{topic.description}</div>}
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">← Vissza</Link>
      </div>

      {stats && <section className="topic-analytics card"><div><span className="eyebrow">Témaszintű kép</span><h2>Összesített haladás</h2></div><div className="topic-analytics-grid"><div><strong>{stats.quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}</strong><span>kvízkitöltés</span></div><div><strong>{stats.quizzes.length ? Math.round(stats.quizzes.reduce((sum, quiz) => sum + quiz.avg_score, 0) / stats.quizzes.length) : 0}%</strong><span>átlagos eredmény</span></div><div><strong>{stats.packs.reduce((sum, pack) => sum + pack.reviews, 0)}</strong><span>kártyaismétlés</span></div><div><strong>{stats.packs.length ? Math.round(stats.packs.reduce((sum, pack) => sum + pack.success_rate, 0) / stats.packs.length) : 0}%</strong><span>felidézési arány</span></div></div></section>}

      <div className="topic-section">
        <h3>Kvízek</h3>
        <QuizList onEdit={() => {}} topicId={topic.id} hideFilter />
      </div>

      <div className="topic-section">
        <h3>Tanulókártyák</h3>
        <Flashcards topicId={topic.id} />
      </div>
    </PageLayout>
  );
};
