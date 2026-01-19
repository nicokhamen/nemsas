// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { getEnrolleeById, submitAuthorization } from '../services/api/enrolleeApi';
// import { getClaimById, getClaimsByEnrollee, type ClaimDetailData } from '../services/api/claimsApi';
// import type { Enrollee, AuthorizationRequestPayload } from '../types/Enrollee';
// import Tabs from '../components/ui/Tabs';
// import Button from '../components/ui/Button';
// import { useProviderContext } from '../context/useProviderContext';
// import Modal from '../components/ui/Modal';
// import FileDropZone from '../components/ui/FileDropZone';

// const EnrolleeDetails: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const { selectedProviderId } = useProviderContext();
//   const [data, setData] = useState<Enrollee | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string|null>(null);
//   const [tab, setTab] = useState('personal');
//   const [authOpen, setAuthOpen] = useState(false);
//   const [authLoading, setAuthLoading] = useState(false);
//   const [authError, setAuthError] = useState<string|null>(null);
//   const [diagnosis, setDiagnosis] = useState('');
//   const [requestSource, setRequestSource] = useState('');
//   const [requestStatus, setRequestStatus] = useState<'Routine'|'Urgent'|'Emergency'>('Routine');
//   const [referralLetter, setReferralLetter] = useState<File|null>(null);
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [requestDate, setRequestDate] = useState<string>(() => new Date().toISOString().slice(0,10)); // YYYY-MM-DD for date input
//   const [successDialogOpen, setSuccessDialogOpen] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     setLoading(true); setError(null);
//     getEnrolleeById(id)
//       .then(res => setData(res.data))
//       .catch(e => setError(e instanceof Error ? e.message : 'Failed to load enrollee'))
//       .finally(()=> setLoading(false));
//   }, [id]);

//   const submitAuth = async () => {
//     if (!data || !selectedProviderId) return;
//   setAuthLoading(true); setAuthError(null);
//     const payload: AuthorizationRequestPayload = {
//       EnrolleeName: `${data.firstName} ${data.lastName}`.trim(),
//       EnrolleeIdNumber: data.enrolleeIdNumber,
//   RequestDate: new Date(requestDate).toISOString(),
//       Diagnosis: diagnosis,
//       RequestSource: requestSource,
//       ReferralLetter: referralLetter || undefined,
//       ProviderId: selectedProviderId,
//       HMOid: data.hmoId,
//       RequestStatus: requestStatus,
//       Attachments: attachments
//     };
//     try {
//       const res = await submitAuthorization(payload);
//       if (res.isSuccess) {
//         // Reset form fields
//         setDiagnosis('');
//         setRequestSource('');
//         setReferralLetter(null);
//         setAttachments([]);
//         setRequestStatus('Routine');
//         setRequestDate(new Date().toISOString().slice(0,10));
//   // success handled via dialog state
//         // Close form modal and show success dialog
//   setAuthOpen(false);
//   setSuccessDialogOpen(true);
//       } else setAuthError(res.message || 'Submission failed');
//     } catch (e) {
//       setAuthError(e instanceof Error ? e.message : 'Submission failed');
//     } finally { setAuthLoading(false); }
//   };

//   // NOTE: early returns moved below all hooks to satisfy exhaustive ordering

//   const d = data; // local alias (may be null until guarded later)
//   const personal = (
//     <div className='text-sm space-y-20'>
//       <div className='grid md:grid-cols-2 gap-8'>
//         <Info label='ID number' value={d?.enrolleeIdNumber} />
//         <Info label='Gender' value={d?.gender} />
//         <Info label='Phone number' value={d?.phoneNumber} />
//         <Info label='HMO/Class' value={d?.enrolleeClass?.name} />
//         <Info label='Plan Type' value={d?.planType?.name} />
//         <Info label='Email' value={d?.emailAddress} />
//       </div>
//       <div>
//         <h4 className='font-avenir font-extrabold text-[16px] leading-5 tracking-tightpx mb-6'>Next of kin information</h4>
//         <div className='grid md:grid-cols-2 gap-8'>
//           <Info label='Full name' value={d?.nextOfKin?.fullName} />
//           <Info label='Relationship' value={d?.nextOfKin?.relationship} />
//           <Info label='Phone number' value={d?.nextOfKin?.phoneNumber} />
//           <Info label='Home address' value={d?.nextOfKin?.homeAddress} />
//         </div>
//       </div>
//     </div>
//   );

//   const dependents = (
//     <div className='text-sm'>
//       <div className='overflow-x-auto'>
//         <table className='w-full text-sm'>
//           <thead>
//             <tr className='bg-[#DC2626]-50 text-left'>
//               <th className='py-2 px-3 font-medium'>Name</th>
//               <th className='py-2 px-3 font-medium'>Gender</th>
//               <th className='py-2 px-3 font-medium'>Age</th>
//             </tr>
//           </thead>
//           <tbody>
//             {d?.dependents.map(dep => {
//               const age = new Date().getFullYear() - new Date(dep.dateOfBirth).getFullYear();
//               return (
//                 <tr key={dep.id} className='border-b last:border-b-0'>
//                   <td className='py-2 px-3'>{dep.firstName} {dep.lastName}</td>
//                   <td className='py-2 px-3'>{dep.gender}</td>
//                   <td className='py-2 px-3'>{age}yrs</td>
//                 </tr>
//               );
//             })}
//             {d?.dependents.length===0 && <tr><td colSpan={3} className='py-4 text-center text-gray-500'>No dependents</td></tr>}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   // Claims tab state (fetch-by-ID interim implementation)
//   const [claimIdInput, setClaimIdInput] = useState('');
//   const [claimFetchLoading, setClaimFetchLoading] = useState(false);
//   const [claimFetchError, setClaimFetchError] = useState<string|null>(null);
//   const [claimsData, setClaimsData] = useState<ClaimDetailData[]>([]);
//   const [claimsAutoLoading, setClaimsAutoLoading] = useState(false);
//   const [expandedClaimId, setExpandedClaimId] = useState<string|null>(null);

//   const fetchClaim = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!claimIdInput.trim()) return;
//     setClaimFetchLoading(true); setClaimFetchError(null);
//     try {
//       const res = await getClaimById(claimIdInput.trim());
//       if (res.isSuccess && res.data) {
//         // Optional filter: ensure claim belongs to this enrollee if patientEnrolleeNumber matches
//   if (d && res.data.patientEnrolleeNumber && res.data.patientEnrolleeNumber !== d.enrolleeIdNumber) {
//           setClaimFetchError('Claim does not belong to this enrollee');
//         } else if (!claimsData.find(c => c.id === res.data.id)) {
//           setClaimsData(prev => [res.data, ...prev]);
//           setExpandedClaimId(res.data.id);
//         }
//       } else setClaimFetchError(res.message || 'Claim not found');
//     } catch (err) {
//       setClaimFetchError(err instanceof Error ? err.message : 'Failed to fetch claim');
//     } finally { setClaimFetchLoading(false); }
//   };

//   // Auto load claims once when switching to claims tab (if not already loaded)
//   useEffect(() => {
//     if (tab === 'claims' && claimsData.length === 0 && data) {
//       setClaimsAutoLoading(true);
//       getClaimsByEnrollee(data.id)
//         .then(res => { if (res.isSuccess && Array.isArray(res.data)) setClaimsData(res.data); })
//         .catch(()=>{/* silent */})
//         .finally(()=> setClaimsAutoLoading(false));
//     }
//   }, [tab, claimsData.length, data]);

//   const claims = (
//     <div className='text-sm'>
//       {claimFetchError && <div className='text-xs text-red-600 mb-3'>{claimFetchError}</div>}
//       {claimsAutoLoading && <div className='text-xs text-gray-500 mb-2'>Loading claims...</div>}
//       {claimsData.length === 0 && !claimsAutoLoading ? (
//         <div className='text-gray-500 text-xs'>No claims available for this enrollee yet.</div>
//       ) : (
//         <>
//         <form onSubmit={fetchClaim} className='flex items-center gap-2 mb-4'>
//           <input value={claimIdInput} onChange={e=>setClaimIdInput(e.target.value)} placeholder='Enter claim ID' className='border rounded px-3 py-2 text-sm flex-1'/>
//           <Button size='sm' type='submit' disabled={claimFetchLoading || !claimIdInput.trim()}>{claimFetchLoading? 'Loading...':'Fetch'}</Button>
//         </form>
//         <div className='border rounded-md overflow-hidden'>
//           <table className='w-full text-xs'>
//             <thead className='bg-[#DC2626]-50 text-gray-700'>
//               <tr>
//                 <th className='text-left px-3 py-2 font-medium'>Date</th>
//                 <th className='text-left px-3 py-2 font-medium'>Claim ID</th>
//                 <th className='text-left px-3 py-2 font-medium'>Amount</th>
//                 <th className='text-left px-3 py-2 font-medium'>Status</th>
//                 <th className='text-left px-3 py-2 font-medium'>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {claimsData.map(c => (
//                 <React.Fragment key={c.id}>
//                   <tr className='border-b last:border-b-0'>
//                     <td className='px-3 py-2'>{new Date(c.serviceDate).toLocaleDateString()}</td>
//                     <td className='px-3 py-2'>{c.id}</td>
//                     <td className='px-3 py-2'>{c.amount.toLocaleString(undefined,{ style:'currency', currency:'NGN'})}</td>
//                     <td className='px-3 py-2'><span className='text-[#DC2626]-700 font-medium'>{c.claimStatus}</span></td>
//                     <td className='px-3 py-2'>
//                       <button type='button' onClick={()=> setExpandedClaimId(p=> p===c.id? null : c.id)} className='text-primary text-xs underline'>
//                         {expandedClaimId === c.id ? 'Hide' : 'View'}
//                       </button>
//                     </td>
//                   </tr>
//                   {expandedClaimId === c.id && (
//                     <tr className='bg-gray-50'>
//                       <td colSpan={5} className='px-4 py-4'>
//                         <div className='grid sm:grid-cols-2 gap-4 text-[11px] mb-4'>
//                           <Detail label='Service rendered' value={c.serviceRendered} />
//                           <Detail label='Diagnosis' value={c.diagnosis} />
//                           <Detail label='Approval code' value={c.approvalCode} />
//                           <Detail label='Referral hospital' value={c.referralHospital} />
//                           <Detail label='Plan type' value={c.planTypeName} />
//                           <Detail label='Claim type' value={c.claimType} />
//                         </div>
//                         <div>
//                           <h4 className='text-[11px] font-semibold text-gray-600 mb-2'>Attachments</h4>
//                           {c.attachments.length === 0 && <div className='text-gray-500 text-[11px]'>None</div>}
//                           <ul className='space-y-1'>
//                             {c.attachments.map(a => (
//                               <li key={a.id} className='flex items-center justify-between text-[11px] bg-white border rounded px-2 py-1'>
//                                 <span className='truncate'>{a.fileName}</span>
//                                 <a href={a.filePath} target='_blank' rel='noreferrer' className='text-primary underline'>Open</a>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         </>
//       )}
//     </div>
//   );

//   const tabs = [
//     { key: 'personal', label: 'Personal details', content: personal },
//     { key: 'dependents', label: 'Dependents', content: dependents },
//     { key: 'claims', label: 'Claims', content: claims }
//   ];

//   if (loading) return <div className='p-6 text-sm'>Loading enrollee...</div>;
//   if (error) return <div className='p-6 text-sm text-red-600'>{error}</div>;
//   if (!data) return null;

//   return (
//     <div className='p-6 font-avenir tracking-tightpx'>
//       <div className='bg-white rounded-md border shadow-sm p-6'>
//         <div className='flex items-start justify-between mb-8'>
//           <div className='flex items-center gap-6'>
//             <div className='w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium'>
//               {data.firstName?.charAt(0)}{data.lastName?.charAt(0)}
//             </div>
//             <div>
//               <h2 className='font-avenir font-extrabold text-[24px] leading-8 tracking-tightpx'>{data.firstName} {data.lastName}</h2>
//               <div className='flex items-center gap-2 text-gray-600 font-avenir font-medium text-[16px] leading-5 tracking-tightpx'>
//                 <span className='font-avenir font-medium text-[16px] leading-5 tracking-tightpx'>{data.enrolleeIdNumber}</span>
//                 <span className={`px-2 py-0.5 rounded border text-[10px] ${data.isActive? 'text-[#DC2626]-700 border-[#DC2626]-600 bg-[#DC2626]-50':'text-gray-600 border-gray-400'}`}>{data.isActive? 'Active':'Inactive'}</span>
//               </div>
//             </div>
//           </div>
//           <div className='flex gap-3'>
//             <Button size='sm' onClick={()=> setAuthOpen(o=>!o)}>Request authorization</Button>
//           </div>
//         </div>
//         <Tabs items={tabs} activeKey={tab} onChange={setTab} />
//         <Modal open={authOpen} onClose={()=> !authLoading && setAuthOpen(false)} title='Authorization Request' width='640px'>
//           {authError && <div className='text-xs text-red-600 mb-2'>{authError}</div>}
//           <div className='grid grid-cols-2 gap-4'>
//             <input type='date' value={requestDate} onChange={e=> setRequestDate(e.target.value)} className='h-[51px] border rounded px-3 font-avenir font-medium text-[16px] leading-5 tracking-tightpx' />
//             <input value={requestSource} onChange={e=>setRequestSource(e.target.value)} className='h-[51px] border rounded px-3 font-avenir font-medium text-[16px] leading-5 tracking-tightpx' placeholder='Request source' />
//             <input disabled value={data.enrolleeIdNumber} className='h-[51px] border rounded px-3 bg-gray-50 col-span-2 font-avenir font-medium text-[16px] leading-5 tracking-tightpx' placeholder='Enrollee ID' />
//             <input disabled value={`${data.firstName} ${data.lastName}`.trim()} className='h-[51px] border rounded px-3 bg-gray-50 col-span-2 font-avenir font-medium text-[16px] leading-5 tracking-tightpx' placeholder='Enrollee name' />
//             <input value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} className='h-[51px] border rounded px-3 col-span-2 font-avenir font-medium text-[16px] leading-5 tracking-tightpx' placeholder='Diagnosis/request reason' />
//             <select value={requestStatus} onChange={e=> setRequestStatus(e.target.value as 'Routine'|'Urgent'|'Emergency')} className='h-[51px] border rounded px-3 col-span-2 font-avenir font-medium text-[16px] leading-5 tracking-tightpx'>
//               <option value='Routine'>Routine</option>
//               <option value='Urgent'>Urgent</option>
//               <option value='Emergency'>Emergency</option>
//             </select>
//             <div className='col-span-2'>
//               <FileDropZone
//                 label='Referral letter'
//                 multiple={false}
//                 files={referralLetter? [referralLetter]: []}
//                 onFilesSelected={(f)=> setReferralLetter(f[0] || null)}
//                 accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
//               />
//             </div>
//             <div className='col-span-2'>
//               <FileDropZone
//                 label='Attachments'
//                 multiple
//                 files={attachments}
//                 onFilesSelected={setAttachments}
//                 accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
//                 maxFiles={10}
//               />
//             </div>
//           </div>
//           <div className='flex justify-end mt-10'>
//             <Button size='sm' disabled={authLoading || !diagnosis || !requestSource || !requestDate} onClick={submitAuth}>{authLoading? 'Submitting...':'Submit request'}</Button>
//           </div>
//         </Modal>
//         <Modal open={successDialogOpen} onClose={()=> { setSuccessDialogOpen(false); }} title='Success' width='420px'>
//           <div className='text-sm mb-4'>Authorization request submitted successfully!</div>
//           <div className='flex justify-end'>
//             <Button size='sm' onClick={()=> { setSuccessDialogOpen(false); }}>Close</Button>
//           </div>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// const Info: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
//   <div className='grid grid-cols-2 md:pr-12'>
//     <div className='font-avenir font-medium text-[16px] leading-5 tracking-tightpx text-left text-[#828282]'>{label}</div>
//     <div className='font-avenir font-extrabold text-[16px] leading-5 tracking-tightpx text-right text-[#051827]'>{value || '-'}</div>
//   </div>
// );

// export default EnrolleeDetails;

// const Detail: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
//   <div className='flex flex-col'>
//     <div className='font-avenir font-medium text-[16px] leading-5 tracking-tightpx text-gray-600'>{label}</div>
//     <div className='font-avenir font-extrabold text-[16px] leading-5 tracking-tightpx text-right break-words'>{value || '-'}</div>
//   </div>
// );
