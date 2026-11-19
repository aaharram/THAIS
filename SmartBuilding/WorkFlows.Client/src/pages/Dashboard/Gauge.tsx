import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

// RMANew (DataEntryLeasing.vb) : les jauges du tableau de bord sont des anneaux
// "circliful" (plugin jQuery) - même rendu ici en anneau Recharts, avec la valeur au
// centre et la même couleur RMA (#1c4d8c sur fond #eee).
export const Gauge = ({
  value,
  label,
  size = 110,
}: {
  value: number;
  label?: string;
  size?: number;
}) => {
  const bornee = Math.max(0, Math.min(value, 100));
  const data = [
    { name: 'valeur', value: bornee },
    { name: 'reste', value: 100 - bornee },
  ];

  return (
    <div className='relative' style={{ width: size, height: size }}>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={data}
            dataKey='value'
            innerRadius='72%'
            outerRadius='100%'
            startAngle={90}
            endAngle={-270}
            stroke='none'
            isAnimationActive={false}
          >
            <Cell fill='#1c4d8c' />
            <Cell fill='#eeeeee' />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className='absolute inset-0 flex items-center justify-center text-lg font-semibold text-[#1c4d8c]'>
        {label ?? `${value}%`}
      </div>
    </div>
  );
};
