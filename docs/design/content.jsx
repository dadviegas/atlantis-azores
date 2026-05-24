// content.jsx — the markdown showcase article
// Renders all widgets in a single sample document on "TypeScript Generics".

function Article({ pageTitle, pagePath }) {
  return (
    <article className="prose atlas-fade-in" style={{ paddingBottom: '8em' }}>

      {/* breadcrumbs + meta */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        color: 'var(--ink-3)', fontSize: '.82em', marginBottom: 18,
        letterSpacing: '.02em',
      }}>
        {pagePath.map((p, i) => (
          <React.Fragment key={i}>
            <span style={{ color: i === pagePath.length - 1 ? 'var(--ink-2)' : 'var(--ink-3)' }}>{p}</span>
            {i < pagePath.length - 1 && <span style={{ opacity: .4 }}>›</span>}
          </React.Fragment>
        ))}
      </div>

      <h1 id="generics" style={{ marginBottom: '.3em', fontFamily: '"Fraunces", "Tiempos Text", Georgia, serif', fontWeight: 500, fontVariationSettings: '"opsz" 144', letterSpacing: '-.03em' }}>
        <span style={{
          display: 'block', fontFamily: 'var(--font-mono)',
          fontSize: '.32em', fontWeight: 500, letterSpacing: '.18em',
          color: 'var(--accent)', textTransform: 'uppercase',
          marginBottom: 8,
        }}>JS · TypeScript · 002</span>
        Generics in <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Depth</em>
      </h1>

      <p style={{ fontSize: '1.15em', color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: '1.5em' }}>
        <span style={{
          float: 'left',
          fontFamily: '"Fraunces", serif',
          fontSize: '3.6em',
          lineHeight: .85,
          padding: '4px 10px 0 0',
          color: 'var(--accent)',
          fontWeight: 500,
          fontVariationSettings: '"opsz" 144',
        }}>G</span>
        enerics let a function or type adapt to whatever shape you hand it without
        losing the trail of where that shape came from. They are TypeScript&rsquo;s
        secret weapon — and the source of most of its frustrating error messages.
      </p>

      {/* author + meta strip */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'center',
        padding: '12px 0', marginBottom: '1.6em',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        fontSize: '.85em', color: 'var(--ink-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            color: '#fff', fontSize: '.7em', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>JC</div>
          <span style={{ color: 'var(--ink) ' }}>You</span>
        </div>
        <span style={{ opacity: .4 }}>·</span>
        <span>Last edited 3 days ago</span>
        <span style={{ opacity: .4 }}>·</span>
        <span>14 min read</span>
        <span style={{ opacity: .4 }}>·</span>
        <span style={{
          padding: '2px 8px', borderRadius: 99,
          background: 'var(--ok-soft)', color: 'var(--ok)',
          fontSize: '.85em', fontWeight: 500,
        }}>verified</span>
      </div>

      <h2 id="why">Why generics?</h2>
      <p>
        Imagine a function that returns the first element of any array. Without generics,
        you either lock it to one type or surrender it to <code>any</code>:
      </p>

      <CodeBlock lang="ts" title="first.ts">
        <T k="cmt">// ❌ too narrow — only works for strings</T>{'\n'}
        <T k="kw">function</T> <T k="fn">firstStr</T>(arr: <T k="typ">string</T>[]): <T k="typ">string</T> {'{'}{'\n'}
        {'  '}<T k="kw">return</T> arr[<T k="num">0</T>];{'\n'}
        {'}'}{'\n'}
        {'\n'}
        <T k="cmt">// ❌ loses type information — caller gets `any`</T>{'\n'}
        <T k="kw">function</T> <T k="fn">firstAny</T>(arr: <T k="typ">any</T>[]): <T k="typ">any</T> {'{'}{'\n'}
        {'  '}<T k="kw">return</T> arr[<T k="num">0</T>];{'\n'}
        {'}'}{'\n'}
        {'\n'}
        <T k="cmt">// ✅ generic — preserves whatever T the caller had</T>{'\n'}
        <T k="kw">function</T> <T k="fn">first</T>&lt;<T k="typ">T</T>&gt;(arr: <T k="typ">T</T>[]): <T k="typ">T</T> | <T k="typ">undefined</T> {'{'}{'\n'}
        {'  '}<T k="kw">return</T> arr[<T k="num">0</T>];{'\n'}
        {'}'}{'\n'}
      </CodeBlock>

      <Callout kind="tip" title="Mental model">
        Read <code>&lt;T&gt;</code> as &ldquo;for any type the caller picks, I&rsquo;ll honor it.&rdquo;
        Each call site instantiates the function with its own concrete <code>T</code>.
      </Callout>

      <h2 id="constraints">Constraints &amp; defaults</h2>
      <p>
        A bare <code>T</code> can be anything, which means you can&rsquo;t do much with it
        inside the function. Constrain <code>T</code> with <code>extends</code> when you need to
        access properties:
      </p>

      <CodeBlock lang="ts" title="prop.ts">
        <T k="kw">function</T> <T k="fn">prop</T>&lt;<T k="typ">T</T> <T k="kw">extends</T> <T k="typ">object</T>, <T k="typ">K</T> <T k="kw">extends</T> <T k="kw">keyof</T> <T k="typ">T</T>&gt;({'\n'}
        {'  '}obj: <T k="typ">T</T>,{'\n'}
        {'  '}key: <T k="typ">K</T>,{'\n'}
        {'}'}: <T k="typ">T</T>[<T k="typ">K</T>] {'{'}{'\n'}
        {'  '}<T k="kw">return</T> obj[key];{'\n'}
        {'}'}{'\n'}
        {'\n'}
        <T k="kw">const</T> name = <T k="fn">prop</T>({'{'} name: <T k="str">"Atlas"</T>, year: <T k="num">2026</T> {'}'}, <T k="str">"name"</T>);{'\n'}
        <T k="cmt">//      ^? string</T>{'\n'}
      </CodeBlock>

      <p>
        The two constraints together do something subtle: <code>K extends keyof T</code> ties
        the key to the actual object passed at the call site. Misspell the key and the
        compiler stops you before you ever ship.
      </p>

      <Callout kind="warning" title="Don&rsquo;t over-constrain">
        It&rsquo;s tempting to add <code>extends</code> everywhere. Don&rsquo;t. Each constraint
        narrows what callers can pass — start permissive and tighten only where the body
        actually needs the guarantee.
      </Callout>

      <h2 id="inference">Inference &amp; the call site</h2>
      <p>
        TypeScript infers <code>T</code> from the arguments at the call site. You almost never
        need to write <code>{'<T>'}</code> explicitly — and when you do, it&rsquo;s usually a sign the
        signature is misaligned.
      </p>

      <Mermaid title="How TypeScript resolves a generic call" />

      <h3 id="formula">Inference, formally</h3>
      <p>For a call <MathEq inline>f(a₁, … aₙ)</MathEq> with signature <MathEq inline>f: ⟨T⟩(p₁: τ₁, …) → τᵣ</MathEq>, the inferred type is:</p>

      <MathEq>
        T = <MathEq inline><Sum from="i=1" to="n">τᵢ</Sum> ⊓ Γ</MathEq>{' '}
        where Γ = <Frac n="constraint(T)" d="default(T)" />
      </MathEq>

      <p>
        Read it as: collect a candidate type from every parameter where <code>T</code> appears,
        take their greatest lower bound, and intersect with any declared constraint. The
        full algorithm has more knobs (variance, contextual typing, widening) but this is
        the spine.
      </p>

      <h2 id="patterns">Patterns you&rsquo;ll reach for</h2>

      <h3 id="builder">1. The builder</h3>
      <p>
        Chained method calls that accumulate state. Each call returns <code>this</code> with the
        type narrowed — so the next call sees the fields you just added.
      </p>

      <CodeBlock lang="ts" title="builder.ts">
        <T k="kw">class</T> <T k="typ">Query</T>&lt;<T k="typ">T</T> = {'{}'}&gt; {'{'}{'\n'}
        {'  '}<T k="fn">where</T>&lt;<T k="typ">K</T> <T k="kw">extends</T> <T k="typ">string</T>, <T k="typ">V</T>&gt;(k: <T k="typ">K</T>, v: <T k="typ">V</T>): <T k="typ">Query</T>&lt;<T k="typ">T</T> &amp; <T k="typ">Record</T>&lt;<T k="typ">K</T>, <T k="typ">V</T>&gt;&gt; {'{'}{'\n'}
        {'    '}<T k="kw">return</T> <T k="kw">this</T> <T k="kw">as</T> <T k="typ">any</T>;{'\n'}
        {'  }'}{'\n'}
        {'}'}{'\n'}
        {'\n'}
        <T k="kw">const</T> q = <T k="kw">new</T> <T k="typ">Query</T>()<T k="op">.</T><T k="fn">where</T>(<T k="str">"id"</T>, <T k="num">1</T>)<T k="op">.</T><T k="fn">where</T>(<T k="str">"ok"</T>, <T k="kw">true</T>);{'\n'}
        <T k="cmt">// q: Query&lt;{'{'} id: number; ok: boolean {'}'}&gt;</T>{'\n'}
      </CodeBlock>

      <h3 id="discriminated">2. Discriminated mappers</h3>
      <p>
        Map a discriminated union to handler functions. The compiler infers the right
        payload type per branch.
      </p>

      <CodeBlock lang="ts" title="reducer.ts">
        <T k="kw">type</T> <T k="typ">Action</T> ={'\n'}
        {'  | { type: '}<T k="str">"add"</T>; n: <T k="typ">number</T> {'}'}{'\n'}
        {'  | { type: '}<T k="str">"set"</T>; v: <T k="typ">number</T> {'}'}{'\n'}
        {'  | { type: '}<T k="str">"reset"</T> {'};'}{'\n'}
        {'\n'}
        <T k="kw">const</T> reducer = (s: <T k="typ">number</T>, a: <T k="typ">Action</T>) => {'{'}{'\n'}
        {'  '}<T k="kw">switch</T> (a.type) {'{'}{'\n'}
        {'    '}<T k="kw">case</T> <T k="str">"add"</T>:   <T k="kw">return</T> s + a.n;{'\n'}
        {'    '}<T k="kw">case</T> <T k="str">"set"</T>:   <T k="kw">return</T> a.v;{'\n'}
        {'    '}<T k="kw">case</T> <T k="str">"reset"</T>: <T k="kw">return</T> <T k="num">0</T>;{'\n'}
        {'  }'}{'\n'}
        {'}'};{'\n'}
      </CodeBlock>

      <h2 id="latency">Real-world impact</h2>
      <p>
        Generic-heavy code does cost compile time. Here&rsquo;s a small benchmark from a
        monorepo I track:
      </p>

      <LineChart
        title="Type-check time, generic refactor"
        unit="s"
        data={[
          { label: 'before', color: 'var(--ink-3)', values: [42, 44, 41, 48, 51, 49, 47] },
          { label: 'after',  color: 'var(--accent)', values: [42, 22, 23, 21, 19, 18, 17] },
        ]}
      />

      <BarChart
        title="Type errors caught at compile time, per week"
        data={[
          { label: 'TS strict',  value: 218, color: 'var(--primary)' },
          { label: 'TS lenient', value: 84,  color: 'var(--info)' },
          { label: 'Plain JS',   value: 12,  color: 'var(--warn)' },
          { label: 'JSDoc only', value: 41,  color: 'var(--accent)' },
        ]}
      />

      <h2 id="checklist">Checklist before shipping</h2>
      <TaskList
        title="PR-ready review"
        initialTasks={[
          { label: 'No unused type parameters', done: true },
          { label: 'Constraints documented in JSDoc', done: true },
          { label: 'Tested with at least one wide and one narrow T', done: false },
          { label: 'No type assertions inside generic body', done: false },
          { label: 'Compile time within 10% of baseline', done: false },
        ]}
      />

      <h2 id="utility">Quick utility reference</h2>
      <table>
        <thead>
          <tr><th>Utility</th><th>Shape</th><th>Returns</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Partial&lt;T&gt;</code></td><td>object</td><td>All fields optional</td></tr>
          <tr><td><code>Required&lt;T&gt;</code></td><td>object</td><td>All fields required</td></tr>
          <tr><td><code>Pick&lt;T, K&gt;</code></td><td>object &amp; keys</td><td>Subset by K</td></tr>
          <tr><td><code>Omit&lt;T, K&gt;</code></td><td>object &amp; keys</td><td>T minus K</td></tr>
          <tr><td><code>Record&lt;K, V&gt;</code></td><td>keys, value</td><td>Dictionary</td></tr>
          <tr><td><code>ReturnType&lt;F&gt;</code></td><td>function</td><td>Inferred return</td></tr>
        </tbody>
      </table>

      <Callout kind="danger" title="The 'any' escape hatch">
        Reaching for <code>any</code> inside a generic body voids the warranty. The
        constraint may still look right at the call site, but inside the function you
        can do anything, and the caller bears the cost at runtime.
      </Callout>

      <Callout kind="success" title="Done well, generics are invisible">
        The best generic signatures read like ordinary functions at the call site. The
        machinery should evaporate.
      </Callout>

      <h3 id="toast">Live notifications</h3>
      <p style={{ marginBottom: 14 }}>Toasts and inline notifications use the same accent colors as callouts, kept restrained:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.6em' }}>
        <ToastDemo kind="success" title="Saved" body="Your changes synced to Atlas in 24ms." />
        <ToastDemo kind="info" title="New version available" body="Atlas 2.4 introduces command palette filters." />
        <ToastDemo kind="danger" title="Sync failed" body="Network unreachable. Retrying in 5 seconds." />
      </div>

      <blockquote>
        <p>
          The best generics make code read like ordinary functions and behave like
          mathematical proofs.
        </p>
        <p style={{ fontSize: '.85em', fontStyle: 'normal', color: 'var(--ink-3)' }}>— A senior engineer I trust</p>
      </blockquote>

      <h3 id="figure">Diagram</h3>
      <ImageFigure caption="Fig 1. The dependency graph of a generic type-resolution pass." />

      <hr />

      <p style={{ color: 'var(--ink-3)', fontSize: '.88em' }}>
        Found a mistake? Edit this page locally — Atlas keeps everything in
        plain markdown files. Use <Kbd>⌘</Kbd>&thinsp;<Kbd>K</Kbd> to jump anywhere in the atlas.
      </p>

    </article>
  );
}

window.Article = Article;
