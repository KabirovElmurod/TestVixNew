import { useState, useEffect } from 'react';
import { adminGetAllHashtags, adminCreateHashtag, adminDeleteHashtag, adminUpdateHashtag } from '../../../api/request_testlar';

export function useHashtags() {
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchHashtags = async () => {
        try {
            setLoading(true);
            const data = await adminGetAllHashtags();
            if (Array.isArray(data)) {
                setHashtags(data);
            } else {
                setHashtags([]);
            }
        } catch (err) {
            console.error('Error fetching hashtags:', err);
        } finally {
            setLoading(false);
        }
    };

    const createHashtag = async (name) => {
        try {
            const result = await adminCreateHashtag(name.trim());
            if (result.status === true) {
                await fetchHashtags();
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Hashtag yaratishda xatolik' };
            }
        } catch (err) {
            return { success: false, message: 'Server bilan bog\'lanishda xatolik' };
        }
    };

    const updateHashtag = async (id, name) => {
        try {
            const result = await adminUpdateHashtag(id, name.trim());
            if (result.status === true) {
                await fetchHashtags();
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Hashtag yangilashda xatolik' };
            }
        } catch (err) {
            return { success: false, message: 'Server bilan bog\'lanishda xatolik' };
        }
    };

    const deleteHashtag = async (id) => {
        try {
            const result = await adminDeleteHashtag(id);
            if (result.status === true) {
                await fetchHashtags();
                return { success: true };
            } else {
                return { success: false, message: result.message || 'Hashtag o\'chirishda xatolik' };
            }
        } catch (err) {
            return { success: false, message: 'Server bilan bog\'lanishda xatolik' };
        }
    };

    useEffect(() => {
        fetchHashtags();
    }, []);

    const totalPages = Math.max(1, Math.ceil(hashtags.length / pageSize));
    const pagedData = hashtags.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return {
        hashtags,
        pagedData,
        loading,
        page,
        totalPages,
        setPage,
        createHashtag,
        updateHashtag,
        deleteHashtag,
        refetch: fetchHashtags
    };
}