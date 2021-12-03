import React, { useEffect, useRef } from 'react';
import {
  useTable,
  useSortBy,
  Column,
  SortingRule,
  usePagination,
  CellProps,
} from 'react-table';
import { MetaFunction, LinksFunction } from 'remix';

import stylesUrl from '~/styles/table.css';

export let meta: MetaFunction = () => {
  return {
    title: 'Table',
  };
};

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

interface TableProps<D extends object> {
  columns: Column<D>[];
  data: D[];
  pageCount?: number;
  onChange?: (sort: SortingRule<D>[]) => void;
}

function DefaultCellRenderer(props: CellProps<object>) {
  return props.value ?? 'N/A';
}

function Table<D extends object = {}>({
  columns,
  data,
  onChange,
  pageCount = 20,
}: TableProps<D>) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy, pageIndex, pageSize },
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    page,
  } = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      autoResetSortBy: false,
      manualPagination: true,
      autoResetPage: false,
      pageCount,
      stateReducer(newState, action) {
        console.log(action, newState);
        return newState;
      },
      defaultColumn: {
        Cell: DefaultCellRenderer,
      },
    },
    useSortBy,
    usePagination
  );
  const onChangeFn = useRef(onChange);

  useEffect(() => {
    onChangeFn.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (onChangeFn.current) {
      onChangeFn.current(sortBy);
    }
  }, [sortBy, pageIndex, pageSize]);

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface Data {
  title: string;
  cost: number;
}

const data: Data[] = [
  {
    title: 'test 1',
    cost: 12,
  },
  {
    title: 'test 2',
    cost: 78.23,
  },
  {
    title: 'test 3',
    cost: 892.12,
  },
];

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function TablePage() {
  const columns = React.useMemo<Column<Data>[]>(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
      },
      {
        Header: 'Cost',
        accessor: 'cost',
        width: 300,
        Cell: ({ value }) => formatter.format(value),
        Footer() {
          return 7;
        },
      },
    ],
    []
  );

  return (
    <div>
      <h2>Table</h2>
      <Table
        columns={columns}
        data={data}
        onChange={(sortBy) => {
          console.log('change', sortBy);
        }}
      />
    </div>
  );
}
