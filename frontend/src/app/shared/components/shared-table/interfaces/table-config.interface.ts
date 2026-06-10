export type ColumnType =
    | 'text'
    | 'currency'
    | 'date'
    | 'boolean'
    | 'tag'
    | 'actions'
    | 'image'
    | 'rating'
    | 'selectbutton';

export interface SelectButtonOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface TableColumn {
    field: string;
    header: string;
    type?: ColumnType;
    sortable?: boolean;
    width?: string;
    currencyCode?: string;
    selectOptions?: SelectButtonOption[] | ((row: any) => SelectButtonOption[]);
}

export interface RowAction {
  key: string;
  icon: string;
  tooltip?: string;
  visible?: boolean; // 👈 CRUCIAL: Propiedad para ocultar/mostrar
  severity?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast'; 
}

export interface ActionEvent {
  action: string;
  data: any;
}