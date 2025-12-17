import React from "react";
import {
    X,
    Pencil,
} from "lucide-react";

const ClaimsDetails = () => {

    return (
        <>
        <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Claims Details</h2>
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Claim Meta */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-red-500 font-medium">Claim ID</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium">FCT/ETC/006</span>
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Rejected
                    </span>
                </div>

                <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg">
                    <Pencil className="w-4 h-4" />
                    Edit & Resubmit
                </button>
            </div>

            {/* Patient Header */}
            <div className="px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden" />
                <div>
                    <p className="font-semibold">Thelma George</p>
                    <p className="text-sm text-gray-500">PT100</p>
                </div>
            </div>

            {/* Patient Details */}
            <Section title="Patient Details">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <Item label="Patient Number" value="PT100" />
                    <Item label="Gender" value="Male" />
                    <Item label="Phone number" value="+23456789009" />
                    <Item label="Insurance" value="NHIS" />
                    <Item label="Hospital Name" value="GOPD" />
                    <Item label="Email" value="thelma.george@gmail.com" />
                </div>
            </Section>

            {/* Encounter Details */}
            <Section title="Encounter Details & Diagnosis">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <Item label="Encounter ID" value="ENID-29012" />
                    <Item label="Emergency Type" value="Collapse" />
                    <Item label="Encounter Date" value="12/12/2025" />
                    <Item label="Ward/Unit" value="NHIS" />
                    <Item label="Diagnosis" value="Type 2 Diabetes mellitus" />
                    <Item label="Type" value="ICD10" />
                    <Item label="Code" value="B542" />
                    <Item label="Note" value="No comment..." />
                </div>
            </Section>

            {/* Services */}
            <Section title="Services Billed">
                <div className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-5 bg-green-50 text-xs font-medium text-gray-600 px-4 py-3">
                        <div>Tariff Code</div>
                        <div>Description</div>
                        <div>Qty</div>
                        <div>Unit Price</div>
                        <div>Total Amount</div>
                    </div>
                </div>
            </Section>
        </div>
        </>
    );
};

const Section = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="px-6 py-4 border-t">
        <h3 className="text-sm font-semibold text-red-500 mb-4">{title}</h3>
        {children}
    </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-sm">
        {children}
    </div>
);

const Item = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">{value}</span>
    </div>
);

export default ClaimsDetails;
