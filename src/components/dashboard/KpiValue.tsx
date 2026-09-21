type KpiValueProps = {
    value: number | string,
    unit?: string,
};

export function KpiValue({value, unit}: KpiValueProps) {
    return (
        <div>
            <span className="text-4xl mr-2">{value}</span>
            <span>{unit}</span>
        </div>
    )
}