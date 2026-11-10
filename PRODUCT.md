# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Existente: React 19 + Vite + Tailwind CSS 4 (sin librerías adicionales de UI); backend Node.js + Express + MongoDB.

## Users
Aplicación educativa de ejemplo (trabajo práctico de Ingeniería Web). Se evalúa en una demostración presencial ante el docente y compañeros, en laptop y en celular. Dentro de la app, el rol modelado es el de un titular de cuenta que consulta su saldo y hace operaciones simples.

## Product Purpose
Gestionar una cuenta bancaria simplificada: consultar saldo, depositar, retirar, transferir entre cuentas y revisar el historial de movimientos, con datos persistidos en MongoDB local. El éxito es una demostración clara y funcional de cada operación.

## Positioning
Producto académico sin autenticación ni roles; no pretende ser un banco real.

## Operating Context
Cuentas de prueba creadas con `npm run seed` (001-0001 a 001-0004). El usuario escribe el número de cuenta para consultarla. Moneda: soles (S/). Idioma: español.

## Capabilities and Constraints
- Operaciones: depósito, retiro, transferencia, historial (últimos 20 movimientos).
- Sin autenticación ni roles (fuera del alcance de la consigna).
- Solo clases utilitarias de Tailwind; sin librerías nuevas.
- Simplicidad del código: coherente con lo enseñado en clase (useState, useEffect, Props).
- Estructura de pantallas acordada: pantalla principal con saldo, tres botones grandes (depositar, retirar, transferir) e historial; una pantalla por operación.

## Brand Commitments
Nombre visible actual: "Mi Cuenta Bancaria". Sin logotipo ni marca propia.

## Evidence on Hand
Datos de cuentas y movimientos de prueba en MongoDB (seed). No hay testimonios, clientes ni métricas reales; no inventarlos.

## Product Principles
1. Claridad del dinero primero: saldo y montos siempre legibles e inequívocos.
2. Una acción por pantalla: cada operación tiene su propio espacio y su confirmación.
3. Retroalimentación explícita: éxito, error y carga siempre visibles.
4. Simplicidad sobre sofisticación.

## Accessibility & Inclusion
Contraste suficiente, controles táctiles amplios, uso con teclado y etiquetas en formularios.
