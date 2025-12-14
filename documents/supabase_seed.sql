-- Seed data for local testing
-- Safe to re-run.

create extension if not exists "pgcrypto";

-- Subjects
insert into public.subjects (id, name)
values
  ('java', 'Java'),
  ('typescript', 'TypeScript')
on conflict (id) do update
set name = excluded.name;

-- Upsert key for questions (since id is UUID)
create unique index if not exists questions_subject_question_text_uq
on public.questions (subject_id, question_text);

-- Questions
insert into public.questions (subject_id, question_text, expert_answer)
values
  -- =========================
  -- Java
  -- =========================
  ('java', 'What is encapsulation in Java and why is it useful?',
   'Encapsulation is bundling state and behavior together and controlling access to the state via access modifiers and methods. It enforces invariants, reduces coupling, and lets you change internals without breaking callers.'),

  ('java', 'Explain the contract between equals() and hashCode(). What breaks if you violate it?',
   'If a.equals(b) is true then a.hashCode() must equal b.hashCode(). Violating this breaks HashMap/HashSet semantics: lookups may fail and duplicates can appear.'),

  ('java', 'How do you design an immutable class in Java?',
   'Use private final fields, initialize via constructor, provide no setters, make defensive copies of mutable fields/inputs, and avoid exposing internal references. Often make the class final to prevent subclass mutation.'),

  ('java', 'Checked vs unchecked exceptions: differences and when to use each?',
   'Checked exceptions must be declared/caught and represent recoverable conditions. Unchecked exceptions are typically programmer errors/invalid state. Use checked when callers can reasonably recover.'),

  ('java', 'ArrayList vs LinkedList: differences and typical use cases?',
   'ArrayList has fast random access and good cache locality; inserts/removes in the middle are O(n). LinkedList has O(n) access and higher overhead; it can be OK for frequent head/tail operations but is often slower in practice.'),

  ('java', 'What does volatile do in Java? What does it not do?',
   'volatile provides visibility and ordering guarantees for reads/writes of that variable. It does not make compound operations atomic (e.g., i++), and it does not protect invariants across multiple variables.'),

  ('java', 'synchronized vs ReentrantLock?',
   'Both provide mutual exclusion and visibility. synchronized is simpler and automatically released; ReentrantLock provides tryLock/timeouts/fairness and multiple Condition objects.'),

  ('java', 'Are Java Streams lazy? What does that mean?',
   'Intermediate stream operations are lazy; they execute only when a terminal operation runs. This enables single-pass pipeline execution and short-circuiting operations like findFirst/anyMatch.'),

  ('java', 'High level: how does generational garbage collection work?',
   'Most objects die young, so the JVM collects the young generation frequently (minor GC) and promotes survivors to the old generation collected less often (major GC).'),

  ('java', 'What is dependency injection and why is it used (e.g., in Spring)?',
   'DI provides dependencies from outside rather than constructing them inside a class. This reduces coupling, improves testability, and centralizes configuration and lifecycle management.'),

  -- =========================
  -- TypeScript
  -- =========================
  ('typescript', 'type vs interface in TypeScript: differences and when to use each?',
   'interface supports declaration merging and is good for extensible object contracts. type is more flexible (unions/intersections/mapped/conditional types). Use interface for public/extendable shapes; type for advanced composition.'),

  ('typescript', 'What is type narrowing? Examples with typeof, in, and custom type guards.',
   'Narrowing refines unions via checks: typeof x === "string" narrows to string; "prop" in obj narrows to types that contain that prop; custom guards `x is Foo` narrow within branches.'),

  ('typescript', 'What is the never type used for?',
   'never represents impossible values and is used for exhaustive checks; if all union cases are handled, the remaining value can be assigned to never to enforce correctness.'),

  ('typescript', 'unknown vs any: which is safer and why?',
   'unknown is safer because you must narrow it before using it. any disables type checking and can produce runtime errors. Prefer unknown for untrusted data.'),

  ('typescript', 'Explain generics in TypeScript with an example.',
   'Generics parameterize types: `function first<T>(arr: T[]): T | undefined { return arr[0] }` preserves the element type and enables reusable type-safe functions.'),

  ('typescript', 'What is structural typing in TypeScript and what are implications?',
   'TypeScript is structurally typed: compatibility is based on shape rather than nominal identity. This is flexible but can allow accidental compatibility; branded types can help enforce nominal-like behavior.'),

  ('typescript', 'How do async/await and error handling work in TypeScript/JavaScript?',
   'async functions return Promises. await unwraps the value or throws on rejection. Use try/catch around await to handle errors and avoid unhandled promise rejections.'),

  ('typescript', 'How do you type React useState for nullable/union values?',
   'Use a generic: `useState<string | null>(null)` or `useState<LoadState>("idle")`. For objects, `useState<MyType | null>(null)` is common.'),

  ('typescript', 'Record<string, T> vs Map<string, T> — when do you pick each?',
   'Record/object is JSON-friendly and simple for string-key dictionaries. Map supports any key type, has reliable iteration order and size, and is better for frequent additions/removals.'),

  ('typescript', 'Why do you still need runtime validation with TypeScript?',
   'Types are erased at runtime; external inputs can violate compile-time types. Runtime validation (zod/manual checks) is still required to guarantee safety.' )
on conflict (subject_id, question_text) do update
set expert_answer = excluded.expert_answer;
