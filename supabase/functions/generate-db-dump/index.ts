import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  udt_name: string;
}

interface ConstraintInfo {
  constraint_name: string;
  constraint_type: string;
  column_name: string;
  foreign_table_name: string | null;
  foreign_column_name: string | null;
}

function escapeSQL(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function mapDataType(udtName: string, dataType: string): string {
  const typeMap: Record<string, string> = {
    'uuid': 'UUID',
    'text': 'TEXT',
    'int4': 'INTEGER',
    'int8': 'BIGINT',
    'bool': 'BOOLEAN',
    'timestamptz': 'TIMESTAMP WITH TIME ZONE',
    'timestamp': 'TIMESTAMP',
    'date': 'DATE',
    'numeric': 'NUMERIC',
    'jsonb': 'JSONB',
    'json': 'JSON',
    'varchar': 'VARCHAR',
    '_text': 'TEXT[]',
  };
  return typeMap[udtName] || dataType.toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const tables = [
      'pages',
      'page_translations',
      'content_blocks',
      'content_block_translations',
      'services',
      'service_translations',
      'crm_companies',
      'crm_contacts',
      'crm_deals',
      'crm_tasks',
      'crm_activities',
      'user_roles',
      'backup_content',
      'daily_stats',
      'visitor_sessions',
      'ip_info',
      'page_views'
    ];

    let sqlDump = `--\n-- PostgreSQL Database Full Dump\n`;
    sqlDump += `-- Project: CSUA\n`;
    sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
    sqlDump += `-- This dump includes table structures and data\n`;
    sqlDump += `--\n\n`;

    // Add custom types/enums
    sqlDump += `-- Custom Types\n`;
    sqlDump += `DO $$ BEGIN\n`;
    sqlDump += `  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');\n`;
    sqlDump += `EXCEPTION WHEN duplicate_object THEN NULL; END $$;\n\n`;
    sqlDump += `DO $$ BEGIN\n`;
    sqlDump += `  CREATE TYPE public.activity_type AS ENUM ('note', 'call', 'meeting', 'email');\n`;
    sqlDump += `EXCEPTION WHEN duplicate_object THEN NULL; END $$;\n\n`;
    sqlDump += `DO $$ BEGIN\n`;
    sqlDump += `  CREATE TYPE public.deal_stage AS ENUM ('new', 'in_progress', 'negotiation', 'won', 'lost');\n`;
    sqlDump += `EXCEPTION WHEN duplicate_object THEN NULL; END $$;\n\n`;

    for (const tableName of tables) {
      // Get column information
      const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { p_table_name: tableName })
        .select('*');

      // If RPC doesn't exist, use direct query approach
      let columnInfo: ColumnInfo[] = [];
      
      // Query information_schema directly
      const { data: schemaData } = await supabase
        .from('information_schema.columns' as any)
        .select('column_name, data_type, is_nullable, column_default, udt_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (schemaData) {
        columnInfo = schemaData as unknown as ColumnInfo[];
      }

      // Get table data
      const { data: tableData, error: dataError } = await supabase
        .from(tableName as any)
        .select('*');

      if (dataError) {
        console.error(`Error fetching ${tableName}:`, dataError);
        continue;
      }

      sqlDump += `--\n-- Table: ${tableName}\n--\n`;

      // Generate CREATE TABLE statement based on actual data structure
      if (tableData && tableData.length > 0) {
        const sampleRow = tableData[0];
        const columnNames = Object.keys(sampleRow);
        
        sqlDump += `DROP TABLE IF EXISTS public.${tableName} CASCADE;\n`;
        sqlDump += `CREATE TABLE public.${tableName} (\n`;
        
        const columnDefs: string[] = [];
        for (const colName of columnNames) {
          const sampleValue = sampleRow[colName];
          let colType = 'TEXT';
          
          // Infer type from value
          if (colName === 'id' || colName.endsWith('_id')) {
            colType = 'UUID';
          } else if (typeof sampleValue === 'number') {
            colType = Number.isInteger(sampleValue) ? 'INTEGER' : 'NUMERIC';
          } else if (typeof sampleValue === 'boolean') {
            colType = 'BOOLEAN';
          } else if (sampleValue && typeof sampleValue === 'object') {
            colType = 'JSONB';
          } else if (typeof sampleValue === 'string') {
            if (sampleValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
              colType = 'TIMESTAMP WITH TIME ZONE';
            } else if (sampleValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
              colType = 'DATE';
            }
          }
          
          // Check for enum types
          if (colName === 'role' && tableName === 'user_roles') {
            colType = 'public.app_role';
          } else if (colName === 'activity_type') {
            colType = 'public.activity_type';
          } else if (colName === 'stage' && tableName === 'crm_deals') {
            colType = 'public.deal_stage';
          }
          
          let def = `  ${colName} ${colType}`;
          if (colName === 'id') {
            def += ' NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY';
          }
          columnDefs.push(def);
        }
        
        sqlDump += columnDefs.join(',\n');
        sqlDump += `\n);\n\n`;

        // Generate INSERT statements
        sqlDump += `-- Data for table: ${tableName} (${tableData.length} records)\n`;
        
        for (const row of tableData) {
          const values = columnNames.map(col => escapeSQL(row[col]));
          sqlDump += `INSERT INTO public.${tableName} (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlDump += '\n';
      } else {
        sqlDump += `-- Table ${tableName} is empty or inaccessible\n\n`;
      }
    }

    // Add RLS policies information as comments
    sqlDump += `--\n-- Row Level Security Policies (for reference)\n--\n`;
    sqlDump += `-- Note: RLS policies should be recreated manually based on your security requirements\n`;
    sqlDump += `-- Example:\n`;
    sqlDump += `-- ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;\n`;
    sqlDump += `-- CREATE POLICY "policy_name" ON public.table_name FOR SELECT USING (condition);\n\n`;

    // Add helper function
    sqlDump += `--\n-- Helper function for role checking\n--\n`;
    sqlDump += `CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)\n`;
    sqlDump += `RETURNS BOOLEAN\n`;
    sqlDump += `LANGUAGE sql\n`;
    sqlDump += `STABLE\n`;
    sqlDump += `SECURITY DEFINER\n`;
    sqlDump += `SET search_path = public\n`;
    sqlDump += `AS $$\n`;
    sqlDump += `  SELECT EXISTS (\n`;
    sqlDump += `    SELECT 1\n`;
    sqlDump += `    FROM public.user_roles\n`;
    sqlDump += `    WHERE user_id = _user_id AND role = _role\n`;
    sqlDump += `  )\n`;
    sqlDump += `$$;\n\n`;

    sqlDump += `-- End of dump\n`;

    return new Response(
      JSON.stringify({ success: true, dump: sqlDump }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating dump:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
