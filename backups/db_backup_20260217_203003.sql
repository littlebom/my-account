--
-- PostgreSQL database dump
--

\restrict 6AJWgu65esWdzXxRoxeBiNWR24LgZuI3hPQcxB1ucKrLLbMoHx0xrIBK3bBCUEw

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    tenant_id text,
    user_id text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    old_values jsonb,
    new_values jsonb,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: bill_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_items (
    id text NOT NULL,
    tenant_id text NOT NULL,
    bill_id text NOT NULL,
    line_number integer NOT NULL,
    product_id text,
    description text NOT NULL,
    quantity numeric(18,4) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    amount numeric(18,2) NOT NULL,
    vat_rate numeric(5,2) DEFAULT 7.00 NOT NULL
);


ALTER TABLE public.bill_items OWNER TO postgres;

--
-- Name: billing_note_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_note_items (
    id text NOT NULL,
    tenant_id text NOT NULL,
    billing_note_id text NOT NULL,
    invoice_id text NOT NULL,
    amount numeric(18,2) NOT NULL
);


ALTER TABLE public.billing_note_items OWNER TO postgres;

--
-- Name: billing_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_notes (
    id text NOT NULL,
    tenant_id text NOT NULL,
    document_number text NOT NULL,
    document_date date NOT NULL,
    due_date date NOT NULL,
    customer_id text NOT NULL,
    total_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.billing_notes OWNER TO postgres;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id text NOT NULL,
    tenant_id text NOT NULL,
    document_number text NOT NULL,
    document_date date NOT NULL,
    vendor_id text NOT NULL,
    vendor_invoice_no text,
    subtotal numeric(18,2) DEFAULT 0 NOT NULL,
    vat_amount numeric(18,2) DEFAULT 0 NOT NULL,
    wht_amount numeric(18,2) DEFAULT 0 NOT NULL,
    total_amount numeric(18,2) DEFAULT 0 NOT NULL,
    due_date date,
    paid_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    journal_entry_id text
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id text NOT NULL,
    tenant_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    is_headquarter boolean DEFAULT false NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chart_of_accounts (
    id text NOT NULL,
    tenant_id text NOT NULL,
    account_code text NOT NULL,
    account_name text NOT NULL,
    account_type text NOT NULL,
    parent_id text,
    level integer DEFAULT 1 NOT NULL,
    is_header boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    normal_balance text NOT NULL
);


ALTER TABLE public.chart_of_accounts OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id text NOT NULL,
    tenant_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    tax_id text,
    branch_code text DEFAULT '00000'::text NOT NULL,
    contact_person text,
    email text,
    phone text,
    address text,
    credit_limit numeric(18,2) DEFAULT 0 NOT NULL,
    credit_term integer DEFAULT 30 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id text NOT NULL,
    tenant_id text NOT NULL,
    employee_code text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    id_card_number text,
    department text,
    "position" text,
    salary_type text DEFAULT 'monthly'::text NOT NULL,
    salary_amount numeric(18,2) DEFAULT 0 NOT NULL,
    bank_account text,
    start_date date,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id text NOT NULL,
    tenant_id text NOT NULL,
    invoice_id text NOT NULL,
    line_number integer NOT NULL,
    product_id text,
    description text NOT NULL,
    quantity numeric(18,4) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    discount_amount numeric(18,2) DEFAULT 0 NOT NULL,
    amount numeric(18,2) NOT NULL,
    vat_rate numeric(5,2) DEFAULT 7.00 NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    tenant_id text NOT NULL,
    document_number text NOT NULL,
    document_date date NOT NULL,
    document_type text NOT NULL,
    customer_id text NOT NULL,
    subtotal numeric(18,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(18,2) DEFAULT 0 NOT NULL,
    vat_amount numeric(18,2) DEFAULT 0 NOT NULL,
    total_amount numeric(18,2) DEFAULT 0 NOT NULL,
    due_date date,
    paid_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    journal_entry_id text,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id text NOT NULL,
    tenant_id text NOT NULL,
    entry_number text NOT NULL,
    entry_date date NOT NULL,
    journal_type text NOT NULL,
    reference_type text,
    reference_id text,
    description text,
    total_debit numeric(18,2) DEFAULT 0 NOT NULL,
    total_credit numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    posted_at timestamp(3) without time zone,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_lines (
    id text NOT NULL,
    tenant_id text NOT NULL,
    journal_entry_id text NOT NULL,
    line_number integer NOT NULL,
    account_id text NOT NULL,
    description text,
    debit_amount numeric(18,2) DEFAULT 0 NOT NULL,
    credit_amount numeric(18,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'THB'::text NOT NULL,
    exchange_rate numeric(18,6) DEFAULT 1 NOT NULL
);


ALTER TABLE public.journal_lines OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    tenant_id text NOT NULL,
    document_number text NOT NULL,
    payment_date date NOT NULL,
    payment_method text NOT NULL,
    payment_type text NOT NULL,
    invoice_id text,
    bill_id text,
    amount numeric(18,2) NOT NULL,
    notes text,
    status text DEFAULT 'draft'::text NOT NULL,
    journal_entry_id text,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    tenant_id text NOT NULL,
    code text NOT NULL,
    barcode text,
    name text NOT NULL,
    category_id text,
    product_type text DEFAULT 'inventory'::text NOT NULL,
    base_unit text NOT NULL,
    cost_price numeric(18,4) DEFAULT 0 NOT NULL,
    selling_price numeric(18,4) DEFAULT 0 NOT NULL,
    is_vatable boolean DEFAULT true NOT NULL,
    vat_rate numeric(5,2) DEFAULT 7.00 NOT NULL,
    costing_method text DEFAULT 'average'::text NOT NULL,
    min_stock numeric(18,4) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_items (
    id text NOT NULL,
    tenant_id text NOT NULL,
    quotation_id text NOT NULL,
    line_number integer NOT NULL,
    product_id text,
    description text NOT NULL,
    details text,
    quantity numeric(18,4) NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    discount_amount numeric(18,2) DEFAULT 0 NOT NULL,
    amount numeric(18,2) NOT NULL,
    vat_rate numeric(5,2) DEFAULT 7.00 NOT NULL
);


ALTER TABLE public.quotation_items OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id text NOT NULL,
    tenant_id text NOT NULL,
    document_number text NOT NULL,
    document_date date NOT NULL,
    valid_until date,
    customer_id text NOT NULL,
    subtotal numeric(18,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(18,2) DEFAULT 0 NOT NULL,
    vat_amount numeric(18,2) DEFAULT 0 NOT NULL,
    total_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    tax_id text,
    branch_code text DEFAULT '00000'::text NOT NULL,
    address text,
    phone text,
    email text,
    logo_url text,
    fiscal_year_start integer DEFAULT 1 NOT NULL,
    base_currency text DEFAULT 'THB'::text NOT NULL,
    plan text DEFAULT 'basic'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    tenant_id text,
    email text NOT NULL,
    password_hash text,
    first_name text,
    last_name text,
    role text DEFAULT 'user'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    tenant_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    tax_id text,
    contact_person text,
    email text,
    phone text,
    address text,
    payment_term integer DEFAULT 30 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, tenant_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: bill_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_items (id, tenant_id, bill_id, line_number, product_id, description, quantity, unit_price, amount, vat_rate) FROM stdin;
\.


--
-- Data for Name: billing_note_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_note_items (id, tenant_id, billing_note_id, invoice_id, amount) FROM stdin;
\.


--
-- Data for Name: billing_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_notes (id, tenant_id, document_number, document_date, due_date, customer_id, total_amount, status, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, tenant_id, document_number, document_date, vendor_id, vendor_invoice_no, subtotal, vat_amount, wht_amount, total_amount, due_date, paid_amount, status, journal_entry_id) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, tenant_id, code, name, address, is_headquarter) FROM stdin;
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chart_of_accounts (id, tenant_id, account_code, account_name, account_type, parent_id, level, is_header, is_active, normal_balance) FROM stdin;
2edb87fe-48d9-48aa-8140-88f9614af19f	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	10000	ASSETS	asset	\N	1	t	t	debit
8b75326d-9d98-444f-952b-feb965802d50	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	11000	Current Assets	asset	2edb87fe-48d9-48aa-8140-88f9614af19f	2	t	t	debit
2fef9c1c-2170-4686-b1d8-dfe59befc2c2	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	11100	Cash and Cash Equivalents	asset	8b75326d-9d98-444f-952b-feb965802d50	3	t	t	debit
bb4fc17f-1b07-4d01-b353-29364e160e8f	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	11110	Petty Cash	asset	2fef9c1c-2170-4686-b1d8-dfe59befc2c2	4	f	t	debit
1cdae369-a5be-4aa3-a94e-3e919ba33481	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	11120	Cash at Bank - Savings	asset	2fef9c1c-2170-4686-b1d8-dfe59befc2c2	4	f	t	debit
c9cec071-56c9-4a12-b854-9ce74fed8db6	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	11200	Accounts Receivable	asset	8b75326d-9d98-444f-952b-feb965802d50	3	t	t	debit
72983d7c-e9ac-42de-90ad-8d9ed51c321b	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	11210	Trade Accounts Receivable	asset	c9cec071-56c9-4a12-b854-9ce74fed8db6	4	f	t	debit
d6524867-ccbe-4dff-a3d6-884d2a6b3aea	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	20000	LIABILITIES	liability	\N	1	t	t	credit
ede7c5d3-259f-49c7-963e-e4c32168f49c	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	21000	Current Liabilities	liability	d6524867-ccbe-4dff-a3d6-884d2a6b3aea	2	t	t	credit
f7f1606b-bfaf-49df-b094-051b909d311d	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	21100	Accounts Payable	liability	ede7c5d3-259f-49c7-963e-e4c32168f49c	3	t	t	credit
101d8a27-f492-47b2-9bc0-43c246ae02c7	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	21110	Trade Accounts Payable	liability	f7f1606b-bfaf-49df-b094-051b909d311d	4	f	t	credit
0f525808-4465-4c13-bf25-a24a1145d10d	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	21200	Tax Payable	liability	ede7c5d3-259f-49c7-963e-e4c32168f49c	3	t	t	credit
318e90bf-40c5-42a9-b2b9-debf6cabfa17	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	21210	VAT Payable	liability	0f525808-4465-4c13-bf25-a24a1145d10d	4	f	t	credit
3cbdc44d-ac45-4159-9ca3-17676af855b9	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	30000	SHAREHOLDERS' EQUITY	equity	\N	1	t	t	credit
92a269e9-99c9-45e5-b222-1f46bb0ebba1	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	31000	Share Capital	equity	3cbdc44d-ac45-4159-9ca3-17676af855b9	2	t	t	credit
f3a7d96b-329f-4d5e-b0ee-b7d79f7be3ca	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	31100	Ordinary Shares	equity	92a269e9-99c9-45e5-b222-1f46bb0ebba1	3	f	t	credit
5ea09fe3-a52a-4201-8659-23e6ff58b57e	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	32000	Retained Earnings	equity	3cbdc44d-ac45-4159-9ca3-17676af855b9	2	t	t	credit
a3899f6b-693d-4553-9def-c5595ff8d03e	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	32100	Retained Earnings - Unappropriated	equity	5ea09fe3-a52a-4201-8659-23e6ff58b57e	3	f	t	credit
3b639003-2872-4d31-bbde-73e69d06214e	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	40000	REVENUE	revenue	\N	1	t	t	credit
f5c05e10-96f5-417e-bedd-0407045c9924	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	41000	Sales Revenue	revenue	3b639003-2872-4d31-bbde-73e69d06214e	2	t	t	credit
31df1fac-c18d-4a88-a4a5-39c69ad4b91f	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	41100	Sales - Product A	revenue	f5c05e10-96f5-417e-bedd-0407045c9924	3	f	t	credit
9da6d2e8-bbb5-4733-98ee-e30d4a050edf	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	41200	Service Revenue	revenue	f5c05e10-96f5-417e-bedd-0407045c9924	3	f	t	credit
8b0bc519-2a72-43b2-83e6-4e0a881b44d8	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	50000	EXPENSES	expense	\N	1	t	t	debit
e6d7c9e9-1e55-4e61-809f-8a7b02745040	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	51000	Cost of Sales	expense	8b0bc519-2a72-43b2-83e6-4e0a881b44d8	2	t	t	debit
ae11132d-5930-48f2-a992-588486e43aca	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	51100	Cost of Goods Sold	expense	e6d7c9e9-1e55-4e61-809f-8a7b02745040	3	f	t	debit
6a03d962-8ea6-4930-99be-b342425f5848	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	52000	Operating Expenses	expense	8b0bc519-2a72-43b2-83e6-4e0a881b44d8	2	t	t	debit
8d1c069f-a15c-4830-8859-18cfd7c4d422	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	52100	Salary Expense	expense	6a03d962-8ea6-4930-99be-b342425f5848	3	f	t	debit
42b5ff4b-f545-4425-8df3-6c1e3715dbfe	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	52200	Rent Expense	expense	6a03d962-8ea6-4930-99be-b342425f5848	3	f	t	debit
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, tenant_id, code, name, tax_id, branch_code, contact_person, email, phone, address, credit_limit, credit_term, is_active) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, tenant_id, employee_code, first_name, last_name, id_card_number, department, "position", salary_type, salary_amount, bank_account, start_date, is_active) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, tenant_id, invoice_id, line_number, product_id, description, quantity, unit_price, discount_amount, amount, vat_rate) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, tenant_id, document_number, document_date, document_type, customer_id, subtotal, discount_amount, vat_amount, total_amount, due_date, paid_amount, status, payment_status, journal_entry_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_entries (id, tenant_id, entry_number, entry_date, journal_type, reference_type, reference_id, description, total_debit, total_credit, status, posted_at, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_lines (id, tenant_id, journal_entry_id, line_number, account_id, description, debit_amount, credit_amount, currency, exchange_rate) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, tenant_id, document_number, payment_date, payment_method, payment_type, invoice_id, bill_id, amount, notes, status, journal_entry_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, tenant_id, code, barcode, name, category_id, product_type, base_unit, cost_price, selling_price, is_vatable, vat_rate, costing_method, min_stock, is_active) FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_items (id, tenant_id, quotation_id, line_number, product_id, description, details, quantity, unit_price, discount_amount, amount, vat_rate) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, tenant_id, document_number, document_date, valid_until, customer_id, subtotal, discount_amount, vat_amount, total_amount, status, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, code, name, tax_id, branch_code, address, phone, email, logo_url, fiscal_year_start, base_currency, plan, status, created_at, updated_at) FROM stdin;
e9e97a8e-70c6-4282-baa4-a083c2c95ab5	DEMO001	Demo Company Limited	1234567890123	00000	123 Sukhumvit Road, Watthana, Bangkok 10110	02-123-4567	info@demo.com	\N	1	THB	premium	active	2026-02-17 13:24:11.775	2026-02-17 13:24:11.775
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, email, password_hash, first_name, last_name, role, status, last_login_at, created_at) FROM stdin;
66d4c67d-2cba-4a98-ab9e-0f686f5c3979	e9e97a8e-70c6-4282-baa4-a083c2c95ab5	admin@demo.com	$2b$10$Smk4rxj8OnqzMvbesC6GT.pma6JcsYjexWl.TnedM31VNL0EwTH5q	System	Admin	admin	active	\N	2026-02-17 13:24:11.831
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, tenant_id, code, name, tax_id, contact_person, email, phone, address, payment_term, is_active) FROM stdin;
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: bill_items bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_pkey PRIMARY KEY (id);


--
-- Name: billing_note_items billing_note_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_note_items
    ADD CONSTRAINT billing_note_items_pkey PRIMARY KEY (id);


--
-- Name: billing_notes billing_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_notes
    ADD CONSTRAINT billing_notes_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: billing_notes_tenant_id_document_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX billing_notes_tenant_id_document_number_key ON public.billing_notes USING btree (tenant_id, document_number);


--
-- Name: bills_tenant_id_document_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bills_tenant_id_document_number_key ON public.bills USING btree (tenant_id, document_number);


--
-- Name: branches_tenant_id_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX branches_tenant_id_code_key ON public.branches USING btree (tenant_id, code);


--
-- Name: chart_of_accounts_tenant_id_account_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX chart_of_accounts_tenant_id_account_code_key ON public.chart_of_accounts USING btree (tenant_id, account_code);


--
-- Name: customers_tenant_id_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_tenant_id_code_key ON public.customers USING btree (tenant_id, code);


--
-- Name: employees_tenant_id_employee_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employees_tenant_id_employee_code_key ON public.employees USING btree (tenant_id, employee_code);


--
-- Name: invoices_tenant_id_document_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_tenant_id_document_number_key ON public.invoices USING btree (tenant_id, document_number);


--
-- Name: journal_entries_tenant_id_entry_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX journal_entries_tenant_id_entry_number_key ON public.journal_entries USING btree (tenant_id, entry_number);


--
-- Name: payments_tenant_id_document_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payments_tenant_id_document_number_key ON public.payments USING btree (tenant_id, document_number);


--
-- Name: products_tenant_id_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_tenant_id_code_key ON public.products USING btree (tenant_id, code);


--
-- Name: quotations_tenant_id_document_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX quotations_tenant_id_document_number_key ON public.quotations USING btree (tenant_id, document_number);


--
-- Name: tenants_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_code_key ON public.tenants USING btree (code);


--
-- Name: users_tenant_id_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_tenant_id_email_key ON public.users USING btree (tenant_id, email);


--
-- Name: vendors_tenant_id_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vendors_tenant_id_code_key ON public.vendors USING btree (tenant_id, code);


--
-- Name: activity_logs activity_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bill_items bill_items_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billing_note_items billing_note_items_billing_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_note_items
    ADD CONSTRAINT billing_note_items_billing_note_id_fkey FOREIGN KEY (billing_note_id) REFERENCES public.billing_notes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billing_note_items billing_note_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_note_items
    ADD CONSTRAINT billing_note_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billing_notes billing_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_notes
    ADD CONSTRAINT billing_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: billing_notes billing_notes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_notes
    ADD CONSTRAINT billing_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billing_notes billing_notes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_notes
    ADD CONSTRAINT billing_notes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bills bills_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bills bills_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: branches branches_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chart_of_accounts chart_of_accounts_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chart_of_accounts chart_of_accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_lines journal_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_lines journal_lines_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotation_items quotation_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendors vendors_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO postgres;


--
-- PostgreSQL database dump complete
--

\unrestrict 6AJWgu65esWdzXxRoxeBiNWR24LgZuI3hPQcxB1ucKrLLbMoHx0xrIBK3bBCUEw

