import React, { useState, useEffect, useCallback } from 'react';
import { LS, createComplaint, updateComplaintStatus } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, AlertCircle, CheckCircle, Clock, Check, RefreshCw, Paperclip, X, Image as ImageIcon, Eye } from 'lucide-react';

const Complaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form
    const [description, setDescription] = useState('');
    const [attachedImages, setAttachedImages] = useState([]); // [{ dataUrl, name, size }]
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image lightbox preview modal
    const [previewImage, setPreviewImage] = useState(null);

    const loadData = useCallback(() => {
        if (!user) return;
        const all = LS.get('ri_complaints');
        const mine = user.role === 'admin' ? all : all.filter(c => c.customer_id === user.id);
        setComplaints(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
        window.addEventListener('ri_data_changed', loadData);
        return () => window.removeEventListener('ri_data_changed', loadData);
    }, [loadData]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedImages(prev => [
                    ...prev,
                    {
                        dataUrl: reader.result,
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB'
                    }
                ]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input value so same files can be re-selected if needed
        e.target.value = '';
    };

    const removeImage = (indexToRemove) => {
        setAttachedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        const newComplaint = {
            complaint_id: "C" + Date.now().toString().slice(-6),
            customer_id: user.id,
            description: description.trim(),
            images: attachedImages.map(img => img.dataUrl),
            status: "PENDING",
            createdAt: new Date().toISOString(),
            history: [{ status: "PENDING", at: new Date().toISOString() }]
        };

        createComplaint(newComplaint);
        setDescription('');
        setAttachedImages([]);
        setIsSubmitting(false);
        setShowForm(false);
    };

    const handleStatusUpdate = (id, newStatus) => {
        updateComplaintStatus(id, newStatus, { by: user.id, note: 'User updated status' });
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Support & Complaints</h2>
                    <p className="text-slate-500 text-sm">We're here to help you</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all font-medium text-sm"
                >
                    {showForm ? 'Cancel' : 'New Complaint'}
                </button>
            </div>

            {showForm && (
                <div className="glass-panel p-6 animate-fade-in-down">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Submit a New Complaint</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full glass-input h-32 resize-none"
                                placeholder="Please describe your complaint or issue in detail..."
                                required
                            />
                        </div>

                        {/* Multiple Images Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Attach Images <span className="text-xs text-slate-400 font-normal">(Optional - upload multiple photos/screenshots)</span>
                            </label>

                            <div className="mt-1 flex items-center gap-3">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
                                    <Paperclip size={16} className="text-indigo-600" />
                                    <span>Choose Images</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {attachedImages.length > 0 && (
                                    <span className="text-xs text-indigo-600 font-semibold">
                                        {attachedImages.length} image{attachedImages.length > 1 ? 's' : ''} attached
                                    </span>
                                )}
                            </div>

                            {/* Image Previews */}
                            {attachedImages.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {attachedImages.map((img, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square shadow-sm">
                                            <img
                                                src={img.dataUrl}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-transform hover:scale-110"
                                                title="Remove image"
                                            >
                                                <X size={12} />
                                            </button>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                                                {img.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md font-semibold text-sm disabled:opacity-50"
                            >
                                <Send size={16} />
                                <span>Submit Ticket</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {complaints.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">No complaints found.</p>
                ) : (
                    complaints.map(complaint => (
                        <div key={complaint.complaint_id} className="glass-card p-6 border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex gap-4 flex-1">
                                    <div className={`p-3 rounded-full h-fit flex-shrink-0 ${complaint.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {complaint.status === 'RESOLVED' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="font-bold text-slate-800 text-lg">Ticket #{complaint.complaint_id}</h4>
                                            {complaint.product_id && (
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">Prod: {complaint.product_id}</span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 mb-3 whitespace-pre-wrap">{complaint.description}</p>

                                        {/* Attached images gallery */}
                                        {complaint.images && complaint.images.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-2">
                                                    <ImageIcon size={14} className="text-indigo-500" />
                                                    <span>Attached Images ({complaint.images.length}):</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {complaint.images.map((imgSrc, imgIdx) => (
                                                        <div
                                                            key={imgIdx}
                                                            onClick={() => setPreviewImage(imgSrc)}
                                                            className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all"
                                                        >
                                                            <img
                                                                src={imgSrc}
                                                                alt={`Attachment ${imgIdx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                                                <Eye size={14} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                            {complaint.history?.length > 1 && (
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Clock size={12} /> Last Update: {new Date(complaint.history[complaint.history.length - 1].at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${complaint.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        complaint.status === 'IN-PROGRESS' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                        {complaint.status}
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        {complaint.status !== 'RESOLVED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(complaint.complaint_id, 'RESOLVED')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                                            >
                                                <Check size={14} /> Mark Resolved
                                            </button>
                                        )}
                                        {complaint.status === 'RESOLVED' && (
                                            <button
                                                onClick={() => handleStatusUpdate(complaint.complaint_id, 'PENDING')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                                            >
                                                <RefreshCw size={14} /> Re-open
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Lightbox Modal for Image Preview */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Full preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-xl mx-auto"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Complaints;
