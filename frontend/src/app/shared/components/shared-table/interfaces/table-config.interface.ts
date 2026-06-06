export type ColumnType = 'text' | 'currency' | 'date' | 'boolean' | 'tag' | 'actions' | 'image' | 'rating';

export interface TableColumn {
  field: string;
  header: string;
  type?: ColumnType; // Si no se define, es 'text'
  sortable?: boolean;
  width?: string;
  currencyCode?: string; // Para tipo 'currency'
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