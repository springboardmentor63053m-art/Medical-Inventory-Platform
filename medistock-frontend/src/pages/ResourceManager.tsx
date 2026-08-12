import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";

import axiosInstance from "@/api/axios";
import { CrudService } from "@/api/crudService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/* =========================================================
   TYPES
========================================================= */

type FieldType =
  | "text"
  | "number"
  | "date"
  | "datetime-local"
  | "boolean"
  | "select";

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  reference?: {
    endpoint: string;
    label: string;
  };
};

export type FilterConfig = {
  key: string;
  label: string;
  endpoint: string;
  param: string;
  type: "select" | "reference" | "dynamic";
  options?: {
    label: string;
    value: string;
  }[];
  reference?: {
    endpoint: string;
    label: string;
  };
  dynamicKey?: string;
};

export type ResourceConfig = {
  title: string;
  singular: string;
  endpoint: string;
  fields: Field[];
  searchEndpoint?: string;
  special?: "inventory" | "notifications" | "expiries";
  filters?: FilterConfig[];
};

/* =========================================================
   HELPERS
========================================================= */

const valueForInput = (
  value: unknown,
  type?: FieldType
): string | boolean => {
  if (value === null || value === undefined) {
    return type === "boolean" ? false : "";
  }

  if (type === "date") {
    return String(value).slice(0, 10);
  }

  if (type === "datetime-local") {
    return String(value).slice(0, 16);
  }

  if (typeof value === "object") {
    return String(
      (value as { id?: unknown }).id ?? ""
    );
  }

  return String(value);
};

const displayValue = (
  value: unknown,
  field: Field
): string => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (field.type === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    const objectValue =
      value as Record<string, unknown>;

    return String(
      objectValue.name ??
        objectValue.username ??
        objectValue.label ??
        (objectValue.id
          ? `#${objectValue.id}`
          : "—")
    );
  }

  if (field.key === "price") {
    return `$${Number(value).toFixed(2)}`;
  }

  return String(value);
};

const asRows = (
  value: unknown
): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value as Record<string, unknown>[];
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const candidate = value as {
      content?: unknown;
      data?: unknown;
    };

    if (Array.isArray(candidate.content)) {
      return candidate.content as Record<
        string,
        unknown
      >[];
    }

    if (Array.isArray(candidate.data)) {
      return candidate.data as Record<
        string,
        unknown
      >[];
    }
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

export function ResourceManager({
  config,
}: {
  config?: ResourceConfig;
}) {
  /*
   * IMPORTANT:
   * Protect against ResourceManager being rendered
   * without a valid configuration.
   */
  if (!config) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Card className="w-full max-w-lg border-rose-200 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <DatabaseZap className="h-7 w-7 text-rose-500" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Resource configuration missing
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                The requested admin page does not have
                a valid resource configuration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ConfiguredResourceManager config={config} />
  );
}

/* =========================================================
   ACTUAL RESOURCE MANAGER
========================================================= */

function ConfiguredResourceManager({
  config,
}: {
  config: ResourceConfig;
}) {
  const service = useMemo(
    () =>
      new CrudService<Record<string, unknown>>(
        config.endpoint
      ),
    [config.endpoint]
  );

  const [rows, setRows] = useState<
    Record<string, unknown>[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [query, setQuery] =
    useState("");

  const [activeFilterKey, setActiveFilterKey] =
    useState("");

  const [activeFilterVal, setActiveFilterVal] =
    useState("");

  const [dynamicOptions, setDynamicOptions] =
    useState<Record<string, string[]>>({});

  const [modal, setModal] =
    useState<"create" | "edit" | null>(null);

  const [editing, setEditing] =
    useState<Record<string, unknown> | null>(
      null
    );

  const [form, setForm] =
    useState<Record<string, unknown>>({});

  const [references, setReferences] =
    useState<
      Record<
        string,
        Record<string, unknown>[]
      >
    >({});

  const [saving, setSaving] =
    useState(false);

  /* =====================================================
     ERROR HANDLER
  ===================================================== */

  const extractError = (
    err: unknown,
    fallback: string
  ) => {
    if (
      err &&
      typeof err === "object" &&
      "response" in err
    ) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: {
              message?: string;
            } | string;
          };
        }
      ).response;

      if (response) {
        const message =
          typeof response.data === "object"
            ? response.data?.message
            : response.data;

        return `${fallback} (${
          response.status ?? "error"
        }${
          message
            ? `: ${message}`
            : ""
        })`;
      }
    }

    return fallback;
  };

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await service.getAll();

      const data = asRows(response);

      setRows(data);

      /*
       * Do not clear search/filter values during
       * every refresh unless explicitly requested.
       */

      if (config.filters) {
        const dynamic: Record<
          string,
          string[]
        > = {};

        config.filters.forEach((filter) => {
          if (
            filter.type === "dynamic" &&
            filter.dynamicKey
          ) {
            const values = Array.from(
              new Set(
                data
                  .map((row) =>
                    String(
                      row[
                        filter.dynamicKey!
                      ] ?? ""
                    )
                  )
                  .filter(Boolean)
              )
            );

            values.sort();

            dynamic[filter.key] =
              values;
          }
        });

        setDynamicOptions(dynamic);
      }
    } catch (err) {
      toast.error(
        extractError(
          err,
          `Unable to load ${config.title.toLowerCase()}`
        )
      );
    } finally {
      setLoading(false);
    }
  }, [
    config,
    service,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  /* =====================================================
     LOAD REFERENCE DATA
  ===================================================== */

  useEffect(() => {
    const allReferences = [
      ...config.fields
        .filter(
          (field) => field.reference
        )
        .map(
          (field) =>
            field.reference!
        ),

      ...(config.filters ?? [])
        .filter(
          (filter) =>
            filter.reference
        )
        .map(
          (filter) =>
            filter.reference!
        ),
    ];

    const uniqueReferences = [
      ...new Map(
        allReferences.map(
          (reference) => [
            reference.endpoint,
            reference,
          ]
        )
      ).entries(),
    ];

    if (
      uniqueReferences.length === 0
    ) {
      setReferences({});
      return;
    }

    Promise.all(
      uniqueReferences.map(
        async ([endpoint]) => {
          try {
            const response =
              await new CrudService<
                Record<string, unknown>
              >(endpoint).getAll();

            return [
              endpoint,
              asRows(response),
            ] as const;
          } catch {
            return [
              endpoint,
              [],
            ] as const;
          }
        }
      )
    )
      .then((items) => {
        setReferences(
          Object.fromEntries(items)
        );
      })
      .catch(() => {
        toast.error(
          "Unable to load form choices"
        );
      });
  }, [
    config.fields,
    config.filters,
  ]);

  /* =====================================================
     OPEN CREATE / EDIT
  ===================================================== */

  const open = (
    mode: "create" | "edit",
    row?: Record<string, unknown>
  ) => {
    setEditing(row ?? null);

    const initialForm =
      Object.fromEntries(
        config.fields.map((field) => [
          field.key,
          valueForInput(
            row?.[field.key],
            field.type
          ),
        ])
      );

    setForm(initialForm);
    setModal(mode);
  };

  /* =====================================================
     BUILD PAYLOAD
  ===================================================== */

  const payload = () => {
    return Object.fromEntries(
      config.fields.map((field) => {
        const raw =
          form[field.key];

        /*
         * Reference fields:
         * medicine -> { id: 1 }
         * supplier -> { id: 2 }
         */
        if (field.reference) {
          return [
            field.key,
            raw
              ? {
                  id: Number(raw),
                }
              : null,
          ];
        }

        if (
          field.type === "number"
        ) {
          return [
            field.key,
            raw === ""
              ? null
              : Number(raw),
          ];
        }

        if (
          field.type === "boolean"
        ) {
          return [
            field.key,
            Boolean(raw),
          ];
        }

        return [
          field.key,
          raw === ""
            ? null
            : raw,
        ];
      })
    );
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const save = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const missingRequired =
      config.fields.some(
        (field) =>
          field.required &&
          (
            form[field.key] ===
              undefined ||
            form[field.key] ===
              null ||
            form[field.key] ===
              ""
          )
      );

    if (missingRequired) {
      toast.error(
        "Please complete all required fields"
      );
      return;
    }

    try {
      setSaving(true);

      if (
        modal === "edit" &&
        editing?.id
      ) {
        await service.update(
          String(editing.id),
          payload()
        );
      } else {
        await service.create(
          payload()
        );
      }

      toast.success(
        `${config.singular} ${
          modal === "edit"
            ? "updated"
            : "created"
        }`
      );

      setModal(null);
      setEditing(null);
      setForm({});

      window.dispatchEvent(
        new Event(
          "medistock:data-changed"
        )
      );

      await load();
    } catch (err) {
      toast.error(
        extractError(
          err,
          `Unable to save ${config.singular.toLowerCase()}`
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const remove = async (
    row: Record<string, unknown>
  ) => {
    if (
      !window.confirm(
        `Delete this ${config.singular.toLowerCase()}?`
      )
    ) {
      return;
    }

    try {
      await service.delete(
        String(row.id)
      );

      toast.success(
        `${config.singular} deleted`
      );

      window.dispatchEvent(
        new Event(
          "medistock:data-changed"
        )
      );

      await load();
    } catch (err) {
      toast.error(
        extractError(
          err,
          "Unable to delete — the item may still be referenced by other records"
        )
      );
    }
  };

  /* =====================================================
     SEARCH / FILTER
  ===================================================== */

  const applyData = async (
    searchQuery: string,
    filterKey: string,
    filterValue: string
  ) => {
    setLoading(true);

    try {
      if (
        filterKey &&
        filterValue &&
        config.filters
      ) {
        const filter =
          config.filters.find(
            (item) =>
              item.key ===
              filterKey
          );

        if (!filter) {
          await load();
          return;
        }

        const response =
          await axiosInstance.get(
            filter.endpoint,
            {
              params: {
                [filter.param]:
                  filterValue,
              },
            }
          );

        setRows(
          asRows(response.data)
        );

        return;
      }

      if (
        searchQuery.trim() &&
        config.searchEndpoint
      ) {
        const response =
          await axiosInstance.get(
            config.searchEndpoint,
            {
              params: {
                name: searchQuery.trim(),
              },
            }
          );

        setRows(
          asRows(response.data)
        );

        return;
      }

      const response =
        await service.getAll();

      setRows(asRows(response));
    } catch (err) {
      toast.error(
        extractError(
          err,
          "Search or filter failed"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    filterKey: string,
    value: string
  ) => {
    setActiveFilterKey(
      filterKey
    );

    setActiveFilterVal(
      value
    );

    applyData(
      query,
      filterKey,
      value
    );
  };

  const performSearch = () => {
    applyData(
      query,
      activeFilterKey,
      activeFilterVal
    );
  };

  /* =====================================================
     SPECIAL ACTIONS
  ===================================================== */

  const specialAction = async (
    row: Record<string, unknown>
  ) => {
    try {
      if (
        config.special ===
        "notifications"
      ) {
        await axiosInstance.put(
          `${config.endpoint}/${row.id}/read`
        );

        toast.success(
          "Notification marked as read"
        );
      }

      if (
        config.special ===
        "inventory"
      ) {
        const amount =
          window.prompt(
            "New stock quantity:",
            String(
              row.quantity ?? ""
            )
          );

        if (
          amount === null ||
          amount === ""
        ) {
          return;
        }

        const quantity =
          Number(amount);

        if (
          Number.isNaN(
            quantity
          ) ||
          quantity < 0
        ) {
          toast.error(
            "Please enter a valid quantity"
          );
          return;
        }

        await axiosInstance.put(
          `${config.endpoint}/${row.id}/stock`,
          null,
          {
            params: {
              quantity,
            },
          }
        );

        toast.success(
          "Stock updated"
        );
      }

      window.dispatchEvent(
        new Event(
          "medistock:data-changed"
        )
      );

      await load();
    } catch (err) {
      toast.error(
        extractError(
          err,
          "Action could not be completed"
        )
      );
    }
  };

  /* =====================================================
     FILTER ROWS
  ===================================================== */

  const safeRows =
    asRows(rows);

  const filtered =
    safeRows.filter(
      (row) => {
        if (
          !query.trim()
        ) {
          return true;
        }

        return Object.entries(
          row
        ).some(
          ([key, value]) => {
            const field =
              config.fields.find(
                (item) =>
                  item.key ===
                  key
              );

            const text =
              field
                ? displayValue(
                    value,
                    field
                  )
                : typeof value ===
                  "object"
                ? displayValue(
                    value,
                    {
                      key,
                      label:
                        key,
                    }
                  )
                : String(
                    value ?? ""
                  );

            return text
              .toLowerCase()
              .includes(
                query
                  .toLowerCase()
                  .trim()
              );
          }
        );
      }
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
            Management center
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            {config.title}
          </h2>

          <p className="mt-1 text-slate-500">
            Create, update and keep your{" "}
            {config.title.toLowerCase()}{" "}
            accurate.
          </p>
        </div>

        <Button
          onClick={() =>
            open("create")
          }
          className="rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New {config.singular}
        </Button>
      </div>

      {/* MAIN CARD */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm">

        <CardContent className="p-0">

          {/* SEARCH */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

              <Input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    performSearch();
                  }
                }}
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="h-10 rounded-xl border-slate-200 pl-9"
              />
            </div>

            <Button
              variant="outline"
              onClick={
                performSearch
              }
              className="rounded-xl"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={load}
              title="Refresh"
              className="rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* FILTERS */}
          {config.filters &&
            config.filters.length >
              0 && (
              <div className="flex flex-wrap gap-3 border-b border-slate-100 bg-slate-50/50 p-4">

                {config.filters.map(
                  (filter) => (
                    <select
                      key={
                        filter.key
                      }
                      value={
                        activeFilterKey ===
                        filter.key
                          ? activeFilterVal
                          : ""
                      }
                      onChange={(
                        event
                      ) =>
                        handleFilterChange(
                          filter.key,
                          event.target
                            .value
                        )
                      }
                      className="h-9 min-w-[150px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="">
                        All{" "}
                        {
                          filter.label
                        }
                      </option>

                      {filter.type ===
                        "dynamic" &&
                        (
                          dynamicOptions[
                            filter.key
                          ] ?? []
                        ).map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {
                                option
                              }
                            </option>
                          )
                        )}

                      {filter.type ===
                        "select" &&
                        filter.options?.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}

                      {filter.type ===
                        "reference" &&
                        (
                          references[
                            filter
                              .reference!
                              .endpoint
                          ] ?? []
                        ).map(
                          (
                            item
                          ) => (
                            <option
                              key={String(
                                item.id
                              )}
                              value={String(
                                item.id
                              )}
                            >
                              {String(
                                item[
                                  filter
                                    .reference!
                                    .label
                                ] ??
                                  `#${item.id}`
                              )}
                            </option>
                          )
                        )}
                    </select>
                  )
                )}
              </div>
            )}

          {/* UPCOMING EXPIRIES */}
          {config.special ===
            "expiries" && (
            <div className="px-4 pt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    setLoading(
                      true
                    );

                    const response =
                      await axiosInstance.get(
                        `${config.endpoint}/upcoming`
                      );

                    setRows(
                      asRows(
                        response.data
                      )
                    );
                  } catch {
                    toast.error(
                      "Unable to load upcoming expiries"
                    );
                  } finally {
                    setLoading(
                      false
                    );
                  }
                }}
              >
                Show upcoming expiries
              </Button>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                <tr>
                  {config.fields.map(
                    (field) => (
                      <th
                        key={
                          field.key
                        }
                        className="px-5 py-3 font-semibold"
                      >
                        {
                          field.label
                        }
                      </th>
                    )
                  )}

                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {/* LOADING */}
                {loading && (
                  <tr>
                    <td
                      colSpan={
                        config
                          .fields
                          .length +
                        1
                      }
                      className="p-12 text-center"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-600" />
                    </td>
                  </tr>
                )}

                {/* EMPTY */}
                {!loading &&
                  filtered.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          config
                            .fields
                            .length +
                          1
                        }
                        className="p-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-slate-400">

                          <DatabaseZap className="h-10 w-10 opacity-40" />

                          <p className="text-sm font-medium">
                            No{" "}
                            {config.title.toLowerCase()}{" "}
                            found.
                          </p>

                          <p className="text-xs">
                            Add one using the
                            button above, or
                            check that the
                            backend is running.
                          </p>

                        </div>
                      </td>
                    </tr>
                  )}

                {/* DATA */}
                {!loading &&
                  filtered.map(
                    (row) => (
                      <tr
                        key={String(
                          row.id
                        )}
                        className="transition-colors hover:bg-cyan-50/30"
                      >

                        {config.fields.map(
                          (field) => (
                            <td
                              key={
                                field.key
                              }
                              className="max-w-52 truncate px-5 py-4 text-slate-700"
                            >
                              {displayValue(
                                row[
                                  field.key
                                ],
                                field
                              )}
                            </td>
                          )
                        )}

                        <td className="whitespace-nowrap px-5 py-3 text-right">

                          {/* SPECIAL ACTION */}
                          {config.special && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Run action"
                              onClick={() =>
                                specialAction(
                                  row
                                )
                              }
                            >
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}

                          {/* EDIT */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            onClick={() =>
                              open(
                                "edit",
                                row
                              )
                            }
                          >
                            <Pencil className="h-4 w-4 text-cyan-700" />
                          </Button>

                          {/* DELETE */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() =>
                              remove(
                                row
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>

                        </td>
                      </tr>
                    )
                  )}

              </tbody>

            </table>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">

            <span>
              {filtered.length}{" "}
              record
              {filtered.length ===
              1
                ? ""
                : "s"}
            </span>

            <span className="flex gap-1">
              <ChevronLeft className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
            </span>

          </div>

        </CardContent>
      </Card>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >

            {/* MODAL HEADER */}
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-5">

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {modal ===
                  "edit"
                    ? "Edit"
                    : "New"}{" "}
                  {
                    config.singular
                  }
                </h3>

                <p className="text-sm text-slate-500">
                  Fields marked *
                  are required.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setModal(null)
                }
              >
                <X />
              </Button>

            </div>

            {/* FORM */}
            <div className="grid gap-5 p-6 sm:grid-cols-2">

              {config.fields.map(
                (field) => (
                  <label
                    key={
                      field.key
                    }
                    className={
                      field.type ===
                      "boolean"
                        ? "flex items-center gap-3 pt-7"
                        : "space-y-2"
                    }
                  >

                    <span className="text-sm font-semibold text-slate-700">
                      {
                        field.label
                      }

                      {field.required && (
                        <span className="text-rose-600">
                          {" "}
                          *
                        </span>
                      )}
                    </span>

                    {/* BOOLEAN */}
                    {field.type ===
                    "boolean" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(
                          form[
                            field
                              .key
                          ]
                        )}
                        onChange={(
                          event
                        ) =>
                          setForm(
                            (
                              previous
                            ) => ({
                              ...previous,
                              [field.key]:
                                event
                                  .target
                                  .checked,
                            })
                          )
                        }
                        className="h-4 w-4 accent-cyan-600"
                      />
                    ) : /* SELECT / REFERENCE */
                    field.reference ||
                      field.type ===
                        "select" ? (
                      <select
                        value={String(
                          form[
                            field
                              .key
                          ] ?? ""
                        )}
                        required={
                          field.required
                        }
                        onChange={(
                          event
                        ) =>
                          setForm(
                            (
                              previous
                            ) => ({
                              ...previous,
                              [field.key]:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      >

                        <option value="">
                          Select{" "}
                          {
                            field.label
                          }
                        </option>

                        {field.reference
                          ? (
                              references[
                                field
                                  .reference
                                  .endpoint
                              ] ??
                              []
                            ).map(
                              (
                                item
                              ) => (
                                <option
                                  key={String(
                                    item.id
                                  )}
                                  value={String(
                                    item.id
                                  )}
                                >
                                  {String(
                                    item[
                                      field
                                        .reference!
                                        .label
                                    ] ??
                                      `#${item.id}`
                                  )}
                                </option>
                              )
                            )
                          : field.options?.map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option
                                  }
                                  value={
                                    option
                                  }
                                >
                                  {
                                    option
                                  }
                                </option>
                              )
                            )}

                      </select>
                    ) : (
                      /* NORMAL INPUT */
                      <Input
                        type={
                          field.type ??
                          "text"
                        }
                        required={
                          field.required
                        }
                        value={String(
                          form[
                            field
                              .key
                          ] ?? ""
                        )}
                        onChange={(
                          event
                        ) =>
                          setForm(
                            (
                              previous
                            ) => ({
                              ...previous,
                              [field.key]:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="rounded-lg"
                      />
                    )}

                  </label>
                )
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setModal(null)
                }
              >
                Cancel
              </Button>

              <Button
                disabled={saving}
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {saving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Save{" "}
                {
                  config.singular
                }
              </Button>

            </div>

          </form>
        </div>
      )}

    </div>
  );
}