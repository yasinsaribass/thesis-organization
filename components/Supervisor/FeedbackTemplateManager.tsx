"use client";

import { useState } from "react";
import { createFeedbackTemplate, deleteFeedbackTemplate, updateFeedbackTemplate } from "@/server/feedback-templates.server";
import { useRouter } from "next/navigation";
import { BookTemplate, Trash2, Plus, Tag, X, Edit2 } from "lucide-react";

type Template = {
    id: string;
    title: string;
    content: string;
    category: string | null;
    created_at: string;
};

const CATEGORIES = ["Literature Review", "Methodology", "Writing Quality", "Progress", "General"];

import { useLanguage } from "@/context/LanguageContext";

export function FeedbackTemplateManager({ initialTemplates }: { initialTemplates: Template[] }) {
    const { t } = useLanguage();
    const router = useRouter();
    const [templates, setTemplates] = useState(initialTemplates);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);

    const CATEGORIES_MAP: Record<string, string> = {
        "Literature Review": t.supervisor.feedbackTemplates.categories.literature,
        "Methodology": t.supervisor.feedbackTemplates.categories.methodology,
        "Writing Quality": t.supervisor.feedbackTemplates.categories.writing,
        "Progress": t.supervisor.feedbackTemplates.categories.progress,
        "General": t.supervisor.feedbackTemplates.categories.general
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let result;
        if (editingId) {
            result = await updateFeedbackTemplate(editingId, { title, content, category });
        } else {
            result = await createFeedbackTemplate({ title, content, category });
        }

        setLoading(false);
        if ("error" in result) {
            setError(result.error || "An error occurred");
        } else {
            setShowForm(false);
            setEditingId(null);
            setTitle("");
            setContent("");
            setCategory("");
            router.refresh();
        }
    };

    const handleEdit = (template: Template) => {
        setTitle(template.title || "");
        setContent(template.content || "");
        setCategory(template.category || "");
        setEditingId(template.id || null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.supervisor.feedbackTemplates.deleteConfirm)) return;
        await deleteFeedbackTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center">
                        <BookTemplate className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-900">{t.supervisor.feedbackTemplates.title}</h2>
                        <p className="text-sm text-gray-500">
                            {t.supervisor.feedbackTemplates.templatesCreated
                                .replace("{count}", templates.length.toString())
                                .replace("{plural}", templates.length !== 1 ? "s" : "")}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            setEditingId(null);
                            setTitle("");
                            setContent("");
                            setCategory("");
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors shadow-sm"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? t.supervisor.feedbackTemplates.btnCancel : t.supervisor.feedbackTemplates.btnNew}
                </button>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
                <form onSubmit={handleSave} className="bg-violet-50 border border-violet-100 rounded-2xl p-6 space-y-4 mb-6">
                    <h3 className="font-bold text-violet-900">{editingId ? t.supervisor.feedbackTemplates.editTitle : t.supervisor.feedbackTemplates.createTitle}</h3>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">{t.supervisor.feedbackTemplates.labelTitle}</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={t.supervisor.feedbackTemplates.placeholderTitle}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">{t.supervisor.feedbackTemplates.labelContent}</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder={t.supervisor.feedbackTemplates.placeholderContent}
                            rows={4}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">{t.supervisor.feedbackTemplates.labelCategory}</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                        >
                            <option value="">{t.supervisor.feedbackTemplates.noCategory}</option>
                            {Object.entries(CATEGORIES_MAP).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={loading} className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-50">
                        {loading ? t.supervisor.feedbackTemplates.saving : t.supervisor.feedbackTemplates.btnSave}
                    </button>
                </form>
            )}

            {/* Template List */}
            {templates.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookTemplate className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">{t.supervisor.feedbackTemplates.noTemplates}</p>
                    <p className="text-sm mt-1">{t.supervisor.feedbackTemplates.noTemplatesDesc}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {templates.map(t_item => (
                        <div key={t_item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 text-sm">{t_item.title}</h3>
                                        {t_item.category && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                                                <Tag className="w-3 h-3" /> {CATEGORIES_MAP[t_item.category] || t_item.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{t_item.content}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(t_item)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                                        title={t.supervisor.feedbackTemplates.editHint}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(t_item.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        title={t.supervisor.feedbackTemplates.deleteHint}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
