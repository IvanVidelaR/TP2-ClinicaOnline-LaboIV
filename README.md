# Tp2ClinicaonlineIvanvidelar

## Hosting: 

https://tp2-clinicaonline-ivanvidelar.web.app/

## Sprints terminados: 

### Sprint 1
En esta entrega debemos tener la posibilidad de registrarse, ingresar al sistema y administrar
los usuarios que van a poder utilizar nuestra plataforma. A continuación se detallan algunas
especificaciones:
- Página de bienvenida
  - Tiene que tener los accesos al login y registro del sistema
- Registro
  - Desde esta sección vamos a poder registrar Pacientes y Especialistas.
  - Para los pacientes los datos serán
    - Nombre
    - Apellido
    - Edad
    - DNI
    - Obra Social
    - Mail
    - Password
    - 2 imágenes para su perfil.
  - Para los Especialistas
    - Nombre
    - Apellido
    - Edad
    - DNI
    - Especialidad
      - En este caso se le deberá dar la posibilidad de elegir o agregar alguna que no se encuentre entre las posibilidades
    - Mail
    - Password
    - Imagen de perfil
  - Debemos validar los campos según corresponda
- Login
  - Desde esta sección vamos a ingresar al sistema.
  - Debe contar con los botones de acceso rápido
  - Los usuarios con perfil Especialista solo pueden ingresar si un usuario administrador aprobó su cuenta y verificó el mail al momento de registrarse.
  - Los usuarios con perfil Paciente solo pueden ingresar si verificaron su mail
al momento de registrarse.

- Sección Usuarios
  - Esta sección solamente la va a poder ver el usuario con perfil Administrador
  - Además de ver la información de los usuarios, desde esta sección se deberá habilitar o inhabilitar el acceso al sistema de los usuarios Especialista.
  - También se podrá generar nuevos usuarios, con el mismo requerimiento que en la
sección registro. Pero desde esta sección se podrá generar un usuario Administrador.
  - Para los usuarios Administrador
    - Nombre
    - Apellido
    - Edad
    - DNI
    - Mail
    - Password
    - imágen para su perfil.