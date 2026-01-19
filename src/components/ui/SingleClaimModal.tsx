// import React, { useEffect, useState } from 'react';
// import Modal from './Modal';
// import Button from './Button';
// import Table from './Table';
// import Select from './Select';
// import { getEnrollees } from '../../services/api/enrolleeApi';
// import { createClaims } from '../../services/api/claimsApi';
// import { useProviderContext } from '../../context/useProviderContext';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../../services/store/store';

// interface ServiceItem {
//   name: string;
//   approvalCode: string;
//   amount: string;
// }

// interface SingleClaimModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmitted?: () => void; // callback to refresh list
// }

// const SingleClaimModal: React.FC<SingleClaimModalProps> = ({ open, onClose, onSubmitted }) => {
//   // Enrollee selection
//   const [enrolleeName, setEnrolleeName] = useState(''); // captured for submission payload
//   const [enrolleeId, setEnrolleeId] = useState('');
//   const [enrolleeOptions, setEnrolleeOptions] = useState<{ value: string; label: string; name: string; enrolleeIdNumber:string }[]>([]);
//   const [enrolleeLoading, setEnrolleeLoading] = useState(false);
//   const [enrolleeError, setEnrolleeError] = useState('');
//   const userHmoId = useSelector((s: RootState)=> s.auth.user?.hmoId);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [date, setDate] = useState('');
//   const [serviceType, setServiceType] = useState('');
//   const serviceOptions = [
//     'Inpatient care',
//     'Outpatient care',
//     'Emergency care',
//     'Specialist visit',
//     'Routine care',
//   ];
//   const [items, setItems] = useState<ServiceItem[]>([{ name: '', approvalCode: '', amount: '' }]);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState('');
//   const { selectedProviderId } = useProviderContext();

//   const handleAddItem = () => {
//     setItems([...items, { name: '', approvalCode: '', amount: '' }]);
//   };

//   const handleItemChange = (idx: number, field: keyof ServiceItem, value: string) => {
//     const newItems = [...items];
//     newItems[idx][field] = value;
//     setItems(newItems);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if(!enrolleeId) return;
//     setSubmitting(true); setSubmitError('');
//     try {
//       const nowIso = new Date().toISOString();
//       const claimName = items[0]?.name || `${enrolleeName || 'Claim'} - ${date}`;
//   const providerId = selectedProviderId || '';
//       const hmoId = userHmoId || '';
//       const claimItems = items.map(it=> ({
//         serviceRendered: it.name,
//         enrolleeName: enrolleeName,
//         patientEnrolleeNumber: enrolleeId, // using selected id number
//         providerId,
//         hmoId,
//         enrolleeEmail: '',
//         enrolleePhoneNumber: phoneNumber,
//         claimType: serviceType.replace(/\s+/g,'') || 'InpatientCare',
//         quantity: 1,
//         price: Number(it.amount)||0,
//         discount: 0,
//         amount: Number(it.amount)||0,
//         diagnosis: '',
//         approvalCode: it.approvalCode,
//         referralHospital: '',
//         nhisno: '',
//         serviceDate: date ? new Date(date).toISOString() : nowIso,
//         attachments: [] as string[],
//       }));
//   await createClaims({ claimItems, hmoId, claimDate: nowIso, claimName, providerId });
//   if (onSubmitted) onSubmitted();
//   onClose();
//   } catch {
//       setSubmitError('Failed to submit claim');
//     } finally { setSubmitting(false); }
//   };

//   // Load enrollees on open
//   useEffect(()=>{
//     if(!open || !userHmoId) return;
//     setEnrolleeLoading(true); setEnrolleeError('');
//     interface EnrolleeBrief { id:string; firstName:string; lastName:string; enrolleeIdNumber:string; }
//     getEnrollees({ HMOId: userHmoId, PageNumber:1, PageSize: 100 })
//       .then(res=>{
//         const list = ((res.data||[]) as EnrolleeBrief[]).map(en=> ({
//           value: en.id,
//             label: `${en.firstName} ${en.lastName}`.trim() || en.enrolleeIdNumber,
//             name: `${en.firstName} ${en.lastName}`.trim(),
//             enrolleeIdNumber: en.enrolleeIdNumber
//         }));
//         setEnrolleeOptions(list);
//       })
//       .catch(()=> setEnrolleeError('Failed to load enrollees'))
//       .finally(()=> setEnrolleeLoading(false));
//   },[open, userHmoId]);

//   return (
//     <Modal open={open} onClose={onClose} title="New Claim" width="600px">
//       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//         <div style={{ display: 'flex', flexDirection:'column', gap: 4 }}>
//           <label className='text-sm font-medium text-gray-700'>Enrollee</label>
//           <Select
//             value={enrolleeId}
//             placeholder={enrolleeLoading? 'Loading enrollees...' : 'Select enrollee'}
//             options={enrolleeOptions}
//             onChange={(val)=>{
//               setEnrolleeId(val);
//               const found = enrolleeOptions.find(o=>o.value===val);
//               setEnrolleeName(found?.name || '');
//             }}
//             className='text-sm'
//           />
//           {enrolleeError && <span className='text-xs text-red-600'>{enrolleeError}</span>}
//         </div>
//         <div style={{ display: 'flex', gap: 16 }}>
//           <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone number" required style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
//           <input value={date} onChange={e => setDate(e.target.value)} type="date" required style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
//         </div>
//         <div className='flex items-center gap-5'>
//             <p>Service Type</p>
//           <select value={serviceType} onChange={e => setServiceType(e.target.value)} required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
//             <option value="">Select</option>
//             {serviceOptions.map(option => (
//               <option key={option} value={option}>{option}</option>
//             ))}
//           </select>
//         </div>
//         <Table
//           headers={["S/N", "Service name", "Approval code", "Amount"]}
//           rows={items.map((item, idx) => [
//             idx + 1,
//             <input
//               value={item.name}
//               onChange={e => handleItemChange(idx, 'name', e.target.value)}
//               placeholder="Name"
//               required
//               style={{ width: '100%', padding: 6 }}
//             />,
//             <input
//               value={item.approvalCode}
//               onChange={e => handleItemChange(idx, 'approvalCode', e.target.value)}
//               placeholder="Approval code"
//               required
//               style={{ width: '100%', padding: 6 }}
//             />,
//             <input
//               value={item.amount}
//               onChange={e => handleItemChange(idx, 'amount', e.target.value)}
//               placeholder="Amount"
//               required
//               style={{ width: '100%', padding: 6 }}
//             />,
//           ])}
//         />
//         <Button
//             type="button"
//             onClick={handleAddItem}
//             className="bg-transparent text-[#DC2626]-700 hover:bg-[#DC2626]-50 flex self-start mb-12"
//         >
//             <div className="flex items-center gap-4 text-[#1B5845]">
//                 <div className="w-8 h-8 rounded-lg bg-[#1B5845]/20 text-xl font-extrabold">+</div>
//                 <p>Add item</p>
//             </div>
//         </Button>
//     <div className='flex flex-col gap-2 self-start'>
//           <Button
//               type="submit"
//         disabled={!enrolleeId || !selectedProviderId || submitting}
//         className='flex self-start px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed'
//           >
//         {submitting? 'Submitting...' : 'Submit Claims'}
//           </Button>
//       {!enrolleeId && <span className='text-xs text-gray-500'>Select an enrollee to enable submission.</span>}
//       {enrolleeId && !selectedProviderId && <span className='text-xs text-gray-500'>Select a provider in the header to submit.</span>}
//       {submitError && <span className='text-xs text-red-600'>{submitError}</span>}
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default SingleClaimModal;
