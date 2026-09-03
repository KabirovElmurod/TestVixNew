import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../data/mockData';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { create_user, delete_user, get_users, search_users, update_user } from '../../../api/request_admin';
import { registerUser } from '../../../api/auth';

const PAGE_SIZE = 6;

const EMPTY_FORM = {
    nickname: '',
    edit_username: '',
    username: '',
    email: '',
    password: '',
    is_active: true,
    is_admin: false
};

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(mockUsers);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [pages, setPages] = useState(1);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleting, setDeleting] = useState(null);
    const [message, setMessage] = useState('');

    // const filtered = useMemo(() => {
    //     const q = search.trim().toLowerCase();
    //     return users.filter((u) => {
    //         const matchQ =
    //             !q ||
    //             [u.username, u.nickname, u.email].some((v) =>
    //                 v.toLowerCase().includes(q)
    //             );
    //         const matchS =
    //             statusFilter === 'all' ||
    //             (statusFilter === 'active' && u.is_active) ||
    //             (statusFilter === 'inactive' && !u.is_active)
    //         return matchQ && matchS;
    //     });
    // }, [users, search, statusFilter]);

    // const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    // const safePage = Math.min(page, totalPages);
    // const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    useEffect(() => {
        const fetchUsers = async () => {
            // log('Fetching users from API...');
            let data = {
                'page': 0,
            }
            try {
                const response = await get_users(data);
                console.log('Fetched users:', response);
                setUsers(response.users);
                setPages(response.pages);
                setPage(response.page);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setUser(EMPTY_FORM);
        setEditing('new');
    };

    const openEdit = (user) => {
        setUser({ ...user });
        setForm({ 'id': user.id, 'username': user.username, 'hash_url': user.hash_url });
        setEditing(user.id);
    };

    const saveForm = async (e) => {
        e.preventDefault();
        if (editing === 'new') {
            let data = { ...form };
            console.log('Creating new user with data:', data);
            let res = await create_user(data);
            if (res.status === false) {
                setMessage(res.message);
                return;
            }
            const id = Math.max(0, ...users.map((u) => u.id)) + 1;
            const today = new Date().toISOString().slice(0, 10);
            setUsers([...users, { ...form, id, date_joined: today, last_login: '—' }]);
            setEditing(null);
            setUser(null);
        } else {
            let data = { ...form, id: editing };
            console.log('Updating user with data:', data);
            let res = await update_user({ ...form, id: editing });
            if (res.status === false) {
                setMessage(res.message);
                return;
            }
            setUsers(users.map((u) => (u.id === editing ? { ...u, ...form } : u)));
            setEditing(null);
            setUser(null);
        }

    };

    const deleteForm = async (id, username, hash_url) => {
        let data = {
            'id': id,
            'username': username,
            'hash_url': hash_url
        }
        await delete_user(data);
        setUsers(users.filter((u) => u.id !== id));
        setDeleting(null);
    }

    const toggleActive = (id) => {
        setUsers(users.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u)));
    };
    const handleHumanCreated = (created) => {
        let c = handleCreatedUser(created);
        const date = new Date(c);
        const now = new Date();

        let years = now.getFullYear() - date.getFullYear();
        let months = now.getMonth() - date.getMonth();
        let days = now.getDate() - date.getDate();

        if (days < 0) {
            months--;

            const previousMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                0
            );

            days += previousMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const result = [];

        if (years > 0) result.push(`${years} yil`);
        if (months > 0) result.push(`${months} oy`);
        if (days > 0) result.push(`${days} kun`);

        return result.length
            ? result.join(' ') + ' oldin'
            : 'Bugun';
    }
    const handleCreatedUser = (created) => {
        if (!created) return '—';
        let c = created.split('T')[0];
        return c;
    }

    const handleGetPage = async (page) => {
        if (search) {
            handleSearch(page);
        }
        setPage(page);
        let data = {
            'page': Number(page - 1),
            // 'search': search,
            // 'status': statusFilter
        }
        let res = await get_users(data);
        setUsers(res.users);
        console.log('Fetched users for page', page, ':', res);
        // setPages(res.pages);

    }

    const handleSearch = async (e, page = 1) => {
        e.preventDefault();
        setPage(1);
        let data = {
            'page': Number(page - 1),
            'search': search,
        }
        let res = await search_users(data);
        setUsers(res.users);
        console.log('Fetched users for page', page, ':', res);
    }

    return (
        <div className="page">
            <div className="page__toolbar">
                <form className="search-box" onSubmit={(e) => {
                    handleSearch(e, 1);
                }}>
                    <span className="search-box__icon">🔍</span>
                    <input
                        className="search-box__input"
                        placeholder="Qidirish: username, email, telefon..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </form>
                <select
                    className="select"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">Barchasi</option>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                    <option value="staff">Staff</option>
                </select>
                <button className="btn btn--primary" onClick={openCreate}>
                    + Yangi foydalanuvchi
                </button>
            </div>

            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Foydalanuvchi</th>
                                <th>Email</th>
                                {/* <th>Telefon</th> */}
                                <th>Testlar</th>
                                <th>Natijalar</th>
                                <th>Holat</th>
                                <th>Rol</th>
                                <th>Ro'yhatga o'tgan</th>
                                <th>Qoshilgan</th>
                                <th className="table__actions-col">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            {/* <span className="admin__avatar admin__avatar--sm">
                                                {(u.nickname[0] || u.username[0] || '?').toUpperCase()}
                                                {(u.nickname[0] || '').toUpperCase()}
                                            </span> */}
                                            <div>
                                                <p className="user-cell__name">
                                                    {u.nickname}
                                                </p>
                                                <p className="user-cell__username">@{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    {/* <td>{u.phone}</td> */}
                                    <td>
                                        {u.test_count}
                                    </td>
                                    <td>
                                        {u.natija_count}
                                    </td>
                                    <td>
                                        <button
                                            className={`badge badge--clickable ${u.is_active ? 'badge--green' : 'badge--red'}`}
                                            onClick={() => toggleActive(u.id)}
                                            title="Holatni ozgartirish"
                                        >
                                            {u.is_active ? 'Faol' : 'Nofaol'}
                                        </button>
                                    </td>

                                    <td>
                                        {u.is_admin ? (
                                            <span className="badge badge--violet">Admin</span>
                                        ) : (
                                            <span className="badge badge--gray">User</span>
                                        )}
                                    </td>
                                    <td>{handleHumanCreated(u.created_at)}</td>
                                    <td>{handleCreatedUser(u.created_at)}</td>
                                    <td>
                                        <div className="row-actions">
                                            <button 
                                                className="row-actions__btn" 
                                                onClick={() => navigate(`/admin/tests?user_id=${u.id}`)} 
                                                title="Testlarni ko'rish"
                                            >
                                                📝
                                            </button>
                                            <button className="row-actions__btn" onClick={() => openEdit(u)} title="Tahrirlash">
                                                ✏️
                                            </button>
                                            <button
                                                className="row-actions__btn row-actions__btn--danger"
                                                onClick={() => setDeleting(u)}
                                                title="Ochirish"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="table__empty">
                                        Hech narsa topilmadi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="panel__footer">
                    <span className="panel__count"> ta natija</span>
                    <Pagination page={page} totalPages={pages} onChange={handleGetPage} />
                </div>
            </div>

            {
                editing !== null && (
                    <Modal
                        title={editing === 'new' ? 'Yangi foydalanuvchi' : 'Foydalanuvchini tahrirlash'}
                        onClose={() => setEditing(null)}
                    >
                        <form className="form" onSubmit={saveForm}>
                            <p class="text-danger">{message} </p>
                            <label className="form__field">
                                <span>Ism</span>
                                <input
                                    value={form.nickname ? form.nickname : user.nickname}
                                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                                />
                            </label>
                            {/* <label className="form__field">
                                <span>Familiya</span>
                                <input
                                    value={form.last_name}
                                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                />
                            </label> */}
                            <label className="form__field">
                                <span>Username *</span>
                                <input
                                    required
                                    value={editing === 'new' ? form.username : form.edit_username ? form.edit_username : user.username}
                                    onChange={(e) => {
                                        editing === 'new' ? setForm({ ...form, username: e.target.value }) : setForm({ ...form, edit_username: e.target.value })
                                    }
                                    }
                                />
                            </label>
                            <label className="form__field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    value={form.email ? form.email : user.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </label>
                            <label className="form__field">
                                <span>Password</span>
                                <input
                                    type="email"
                                    value={form.password ? form.password : user.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </label>
                            <div className="form__checks">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" checked={user.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        type="checkbox" role="switch" id="is_active" />
                                    <label className="form-check-label" for="is_active">Active</label>
                                </div>
                                <div className="form-check form-switch">
                                    <input className="form-check-input" checked={user.is_admin}
                                        onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
                                        type="checkbox" role="switch" id="is_admin" />
                                    <label className="form-check-label" for="is_admin">Admin</label>
                                </div>
                            </div>
                            <div className="form__footer">
                                <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                                    Bekor qilish
                                </button>
                                <button type="submit" className="btn btn--primary" onClick={saveForm}>
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </Modal>
                )
            }

            {
                deleting && (
                    <ConfirmDialog
                        title="Foydalanuvchini o'chirish"
                        message={`@${deleting.username} foydalanuvchisini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
                        onCancel={() => setDeleting(null)}
                        onConfirm={() => {
                            deleteForm(deleting.id, deleting.username, deleting.hash_url);
                        }}
                    />
                )
            }
        </div >
    );
}