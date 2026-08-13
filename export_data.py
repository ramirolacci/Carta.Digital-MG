import sys
import os
import getpass

try:
    import pg8000.dbapi
except ImportError:
    print("Error: El paquete 'pg8000' no está instalado.")
    print("Por favor, ejecuta: pip install pg8000")
    sys.exit(1)

def main():
    print("=== EXPORTADOR DE DATOS DE CARTA DIGITAL (SUPABASE) ===")
    print("Conectando a la base de datos de promociones...")
    
    host = "db.qywviysetikpxwxgkzyj.supabase.co"
    port = 5432
    user = "postgres"
    database = "postgres"
    
    password = os.environ.get("DB_PASSWORD")
    if not password:
        password = getpass.getpass(prompt="Introduce la contraseña de la base de datos de Supabase: ")
        
    if not password:
        print("La contraseña es requerida.")
        sys.exit(1)
        
    print("\nConectando a la base de datos...")
    try:
        conn = pg8000.dbapi.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            timeout=15
        )
    except Exception as e:
        print(f"Error al conectar por el puerto 5432: {e}")
        print("Intentando por el puerto del pooler de transacciones (6543)...")
        try:
            conn = pg8000.dbapi.connect(
                host=host,
                port=6543,
                user=user,
                password=password,
                database=database,
                timeout=15
            )
        except Exception as e2:
            print(f"No se pudo conectar a la base de datos: {e2}")
            sys.exit(1)
            
    print("Conexión establecida. Recuperando registros de la tabla 'promotions'...")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, description, imageurl, imagestoragepath, date, active, createdat, updatedat FROM public.promotions ORDER BY date ASC, id ASC;")
        rows = cursor.fetchall()
        print(f"Se encontraron {len(rows)} registros.")
    except Exception as e:
        print(f"Error al consultar la tabla 'promotions': {e}")
        conn.close()
        sys.exit(1)
        
    if not rows:
        print("No hay datos que exportar.")
        conn.close()
        sys.exit(0)
        
    # Generar las sentencias INSERT INTO
    insert_statements = ["\n-- Datos exportados de la base de datos anterior de promociones", "BEGIN;"]
    
    for row in rows:
        # Escapar valores de texto para SQL
        id_val = str(row[0])
        title_val = f"'{row[1].replace(chr(39), chr(39)+chr(39))}'" if row[1] is not None else "NULL"
        description_val = f"'{row[2].replace(chr(39), chr(39)+chr(39))}'" if row[2] is not None else "NULL"
        imageurl_val = f"'{row[3].replace(chr(39), chr(39)+chr(39))}'" if row[3] is not None else "NULL"
        imagestoragepath_val = f"'{row[4].replace(chr(39), chr(39)+chr(39))}'" if row[4] is not None else "NULL"
        date_val = f"'{row[5]}'" if row[5] is not None else "NULL"
        active_val = "TRUE" if row[6] else "FALSE"
        createdat_val = f"'{row[7]}'" if row[7] is not None else "NULL"
        updatedat_val = f"'{row[8]}'" if row[8] is not None else "NULL"
        
        sql = f"INSERT INTO public.promotions (id, title, description, imageurl, imagestoragepath, date, active, createdat, updatedat) VALUES ({id_val}, {title_val}, {description_val}, {imageurl_val}, {imagestoragepath_val}, {date_val}, {active_val}, {createdat_val}, {updatedat_val}) ON CONFLICT (id) DO NOTHING;"
        insert_statements.append(sql)
        
    insert_statements.append("COMMIT;")
    
    # Escribir al archivo migration.sql
    migration_file = "migration.sql"
    try:
        with open(migration_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Si ya hay una sección de datos exportados previos, la cortamos para evitar duplicados
        if "-- Datos exportados de la base de datos anterior de promociones" in content:
            content = content.split("-- Datos exportados de la base de datos anterior de promociones")[0].strip()
            
        new_content = content + "\n" + "\n".join(insert_statements) + "\n"
        
        with open(migration_file, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        print(f"\n¡Éxito! Se han añadido {len(rows)} sentencias INSERT al archivo '{migration_file}'.")
        print("Ahora tienes todo el SQL completo (estructura + datos) en un solo archivo listo para tu nuevo Supabase.")
    except Exception as e:
        print(f"Error al escribir en el archivo {migration_file}: {e}")
        
    conn.close()

if __name__ == "__main__":
    main()
