import React, { useState } from 'react';
import Modal from '../ui/Modal';
// import Input from '../ui/Input';
import Button from '../ui/Button';
import EmailWarningModal from './EmailWarningModal';
import { updateUserProfile } from '../../services/api/userApi';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../services/store/store';
import { loginSuccess } from '../../services/slices/authSlice';
import Input from '../form/Input';

interface Props { open: boolean; onClose: () => void; }

const ProfileEditModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(user?.emailAddress || '');
  const [originalEmail] = useState(user?.emailAddress || '');
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const attemptSubmit = () => {
    setError(null);
    if (email !== originalEmail) {
      setShowEmailWarning(true);
    } else {
      submit();
    }
  };

  const submit = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await updateUserProfile({
        id: user.id,
        firstName,
        lastName,
        phoneNumber,
        email,
      });
      if (res.isSuccess) {
        // Merge back into auth state (keeping token)
        dispatch(loginSuccess({ token: localStorage.getItem('token') || '', user: {
          id: res.data.id,
          fullName: `${res.data.firstName} ${res.data.lastName}`.trim(),
          emailAddress: res.data.email,
          role: user.role,
          hmoId: user.hmoId,
          isProvider: user.isProvider,
          providerId: user.providerId,
          orgType: user.orgType,
          
        }}));
        onClose();
      } else setError(res.message || 'Update failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
      setShowEmailWarning(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Update Profile" width='520px'>
        {error && <div className='mb-3 text-xs text-red-600'>{error}</div>}
        <div className='grid grid-cols-2 gap-4'>
          <Input label='First name' value={firstName} onChange={e=>setFirstName(e.target.value)} />
          <Input label='Last name' value={lastName} onChange={e=>setLastName(e.target.value)} />
        </div>
        <Input label='Phone number' value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} />
        <Input label='Current Email' value={originalEmail} disabled />
        <Input label='New Email' value={email} onChange={e=>setEmail(e.target.value)} />
        <div className='flex justify-end mt-4'>
          <Button size='md' disabled={loading} onClick={attemptSubmit}>{loading ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </Modal>
      <EmailWarningModal open={showEmailWarning} onCancel={()=> setShowEmailWarning(false)} onConfirm={submit} />
    </>
  );
};

export default ProfileEditModal;
