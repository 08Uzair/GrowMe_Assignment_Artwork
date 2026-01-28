import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useLocalStorage } from "./hooks/useLocalStorage";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  place_of_origin: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
  medium_display: string;
  dimensions: string;
  credit_line: string;
  department_title: string;
}

export default function ArtworksPrimeTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(0);
  const rows = 12;

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectCount, setSelectCount] = useState<number>(0);

  const [selectedIds, setSelectedIds] = useLocalStorage<number[]>(
    "selectedArtworks",
    [],
  );

  const fetchData = async (page: number, limit: number) => {
    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=${limit}&fields=id,title,artist_display,place_of_origin,inscriptions,date_start,date_end,medium_display,dimensions,credit_line,department_title`,
    );

    const data = await res.json();
    setArtworks(data.data);
    setTotalRecords(data.pagination.total);
  };

  useEffect(() => {
    fetchData(page, rows);
  }, [page]);

  const handleCheckThis = async () => {
    let needed = selectCount;
    let selected: number[] = [];
    let currentPage = 1;

    while (needed > 0 && currentPage <= Math.ceil(totalRecords / rows)) {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rows}`,
      );
      const data = await res.json();

      for (let art of data.data) {
        if (needed > 0) {
          selected.push(art.id);
          needed--;
        }
      }

      currentPage++;
    }

    setSelectedIds(selected);
    setShowDropdown(false);
  };

  const selectedRows = artworks.filter((a) => selectedIds.includes(a.id));

  const onSelectionChange = (e: any) => {
    setSelectedIds(e.value.map((v: Artwork) => v.id));
  };

  const first = page * rows + 1;
  const last = Math.min(first + rows - 1, totalRecords);

  const totalPages = Math.ceil(totalRecords / rows);

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl border overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <Button
          icon="pi pi-chevron-down"
          text
          onClick={() => setShowDropdown((p) => !p)}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 bg-white p-4 border rounded shadow w-72">
          <InputNumber
            value={selectCount}
            onValueChange={(e) => setSelectCount(e.value || 0)}
            placeholder="Enter number"
            className="w-full mb-3"
          />
          <Button
            label="Select Items"
            className="w-full"
            onClick={handleCheckThis}
          />
        </div>
      )}

      <DataTable
        value={artworks}
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        selectionMode="checkbox"
        stripedRows
        scrollable
        scrollHeight="600px"
        tableStyle={{ minWidth: "120rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="TITLE" frozen />
        <Column field="place_of_origin" header="PLACE OF ORIGIN" />
        <Column field="artist_display" header="ARTIST" />
        <Column field="inscriptions" header="INSCRIPTIONS" />
        <Column field="date_start" header="START DATE" />
        <Column field="date_end" header="END DATE" />
        <Column field="medium_display" header="MEDIUM" />
        <Column field="dimensions" header="DIMENSIONS" />
        <Column field="credit_line" header="CREDIT LINE" />
        <Column field="department_title" header="DEPARTMENT" />
      </DataTable>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>
          Showing {first} to {last} of {totalRecords} entries
        </span>

        <div className="flex gap-2">
          <Button
            label="Previous"
            size="small"
            outlined
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          />

          {[...Array(5)].map((_, i) => {
            const p = page + i;
            if (p >= totalPages) return null;

            return (
              <Button
                key={p}
                label={`${p + 1}`}
                size="small"
                severity={p === page ? "info" : "secondary"}
                outlined={p !== page}
                onClick={() => setPage(p)}
              />
            );
          })}

          <Button
            label="Next"
            size="small"
            outlined
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          />
        </div>
      </div>
    </div>
  );
}
