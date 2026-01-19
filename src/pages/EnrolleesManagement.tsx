// import React, { useEffect, useState, useCallback } from 'react';
// import { getEnrollees, exportEnrolleesReport } from '../services/api/enrolleeApi';
// import type { Enrollee } from '../types/Enrollee';
// import Button from '../components/ui/Button';
// import Table from '../components/ui/Table';
// import EmptyState from '../components/ui/EmptyState';
// import { useNavigate } from 'react-router-dom';
// import { useProviderContext } from '../context/useProviderContext';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../services/store/store';

// const EnrolleesManagement: React.FC = () => {
// 	const navigate = useNavigate();
// 	const { selectedProviderId } = useProviderContext(); // still available if needed later for auth submissions
// 	const userHmoId = useSelector((s: RootState)=> s.auth.user?.hmoId);
// 	const [items, setItems] = useState<Enrollee[]>([]);
// 	const [loading, setLoading] = useState(false);
// 	const [error, setError] = useState<string|null>(null);
// 	const [search, setSearch] = useState('');
// 	const [pageNumber, setPageNumber] = useState(1);
// 	const pageSize = 20;
// 	const [exporting, setExporting] = useState(false);
// 	const [exportError, setExportError] = useState<string|null>(null);

// 		const load = useCallback(() => {
// 		if (!userHmoId) return; // need user HMO id
// 		setLoading(true); setError(null);
// 		const hasDigit = /\d/.test(search);
// 		const params: Record<string, unknown> = {
// 			HMOId: userHmoId,
// 			PageNumber: pageNumber,
// 			PageSize: pageSize
// 		};
// 		if (search) {
// 			if (hasDigit) params.EnrolleeNumber = search; else params.EnrolleeName = search;
// 		}
// 		getEnrollees(params)
// 			.then(res => { setItems(res.data || []); })
// 			.catch(e => setError(e instanceof Error ? e.message : 'Failed to load enrollees'))
// 			.finally(()=> setLoading(false));
// 		}, [userHmoId, search, pageNumber]);

// 		useEffect(() => { load(); }, [load]);

// 	const doSearch = (e: React.FormEvent) => { e.preventDefault(); setPageNumber(1); load(); };

// 	const doExport = async (isExcel: boolean) => {
// 		if (!selectedProviderId) return; // guard
// 		setExporting(true); setExportError(null);
// 		try {
// 			const end = new Date();
// 			const start = new Date(); start.setMonth(start.getMonth()-1);
// 			const blob = await exportEnrolleesReport({ startDate: start.toISOString(), endDate: end.toISOString(), isExcel });
// 			const url = URL.createObjectURL(blob);
// 			const a = document.createElement('a');
// 			a.href = url; a.download = `enrollees.${isExcel ? 'xlsx':'csv'}`; document.body.appendChild(a); a.click(); a.remove();
// 		} catch (e) { setExportError(e instanceof Error ? e.message : 'Export failed'); }
// 		finally { setExporting(false); }
// 	};

// 	return (
// 		<div className='p-6'>
// 			<div className='bg-white p-4 rounded-md shadow-sm mb-6'>
// 				<form onSubmit={doSearch} className='flex items-center gap-3'>
// 					<input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search enrollee name' className='flex-1 border rounded px-3 py-2 text-sm'/>
// 					<Button type='submit' size='sm'>Search</Button>
// 					<Button type='button' size='sm' variant='outline' onClick={()=>{ setSearch(''); setPageNumber(1); load(); }}>Reset</Button>
// 					<div className='ml-auto flex gap-2'>
// 						<Button type='button' size='sm' variant='outline' disabled={exporting} onClick={()=>doExport(false)}>Export CSV</Button>
// 						<Button type='button' size='sm' variant='outline' disabled={exporting} onClick={()=>doExport(true)}>Export Excel</Button>
// 					</div>
// 				</form>
// 				{exportError && <div className='text-xs text-red-600 mt-2'>{exportError}</div>}
// 			</div>
// 			{loading ? <div className='text-center py-16 text-sm'>Loading enrollees...</div> : error ? <div className='text-center py-16 text-red-600 text-sm'>{error}</div> : items.length===0 ? <EmptyState icon={<span>👥</span>} title='No enrollees found' description='Adjust filters or add new enrollees.' /> : (
// 				<div className='bg-white rounded-md shadow-sm p-0 overflow-hidden'>
// 					<Table
// 						headers={['Enrollee ID','Enrollee Name','Gender','Status','Plan Type','Action']}
// 						rows={items.map(en=>[
// 							en.enrolleeIdNumber,
// 							`${en.firstName} ${en.lastName}`.trim(),
// 							en.gender,
// 							<span className={`text-xs px-2 py-1 rounded ${en.isActive? 'text-[#DC2626]-700 bg-[#DC2626]-50':'text-gray-500 bg-gray-50'}`}>{en.isActive? 'Active':'Inactive'}</span>,
// 							en.planType?.name || '-',
// 							<Button size='sm' className='!px-2 !py-1' onClick={()=>navigate(`/enrollees/${en.id}`)}>View</Button>
// 						])}
// 					/>
// 					<div className='flex justify-between items-center p-4 text-xs text-gray-600'>
// 						<span>Showing {(pageNumber-1)*pageSize + 1}-{(pageNumber-1)*pageSize + items.length}</span>
// 						<div className='flex gap-2'>
// 							<Button size='sm' variant='outline' disabled={pageNumber===1} onClick={()=> setPageNumber(p=> Math.max(1,p-1))}>Prev</Button>
// 							<Button size='sm' variant='outline' disabled={items.length<pageSize} onClick={()=> setPageNumber(p=> p+1)}>Next</Button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default EnrolleesManagement;
