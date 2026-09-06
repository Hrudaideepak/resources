/**
 * Unit-level syllabus seed data — JNTUH B.Tech CSE, R22.
 *
 * Transcribed from the official R22 CSE Course Structure & Syllabus PDF
 * (https://jntuh.ac.in/uploads/academics/R22B.Tech.CSECourseStructureSyllabus.pdf).
 * Unit titles use the printed titles where the PDF gives one; otherwise a
 * short descriptive title derived from the unit contents. `topics` is a
 * condensed, comma-separated rendering of the official topic list — it is the
 * raw material for topic → unit matching and, later, syllabus-match scoring.
 *
 * Coverage: every core theory subject across all 8 semesters (28 subjects ×
 * 5 units = 140 rows). Labs, skill courses and PE/OE option lists are
 * intentionally excluded (no unit structure / college-optional). R25 units
 * follow once JNTUH publishes the R25 detailed syllabus.
 */
import type { Unit } from "@/lib/types";

function unitsOf(subjectId: string, rows: [title: string, topics: string][]): Unit[] {
  return rows.map(([title, topics], i) => ({
    id: `${subjectId}-u${i + 1}`,
    subject_id: subjectId,
    unit_number: i + 1,
    title,
    topics,
  }));
}

const ES_UNITS: [string, string][] = [
  [
    "Ecosystems",
    "Definition, scope and importance of ecosystem, classification, structure and function of an ecosystem, food chains, food webs, ecological pyramids, flow of energy, biogeochemical cycles, bioaccumulation, biomagnification, ecosystem value, services and carrying capacity",
  ],
  [
    "Natural Resources",
    "Living and non-living resources, water resources (over-utilization, floods, droughts, dams), mineral resources, land resources, forest resources, energy resources, renewable and non-renewable sources",
  ],
  [
    "Biodiversity and Biotic Resources",
    "Genetic, species and ecosystem diversity, values of biodiversity, India as a mega-diversity nation, biodiversity hotspots, threats (habitat loss, poaching, man-wildlife conflicts), in-situ and ex-situ conservation, National Biodiversity Act",
  ],
  [
    "Environmental Pollution and Control Technologies",
    "Air, water, soil and noise pollution, solid waste and e-waste management, wastewater treatment, bioremediation, climate change, ozone depletion, international conventions (Kyoto, Montreal)",
  ],
  [
    "Environmental Policy, Legislation & EIA",
    "Environmental Protection Act, Air/Water/Forest/Wildlife Acts, waste management rules, EIA, environmental management plan, sustainable development goals, green building, ecological footprint, life cycle assessment",
  ],
];

export const units: Unit[] = [
  // ------------------------------------------------------------- I Year I Sem
  ...unitsOf("r22-cse-1-1-matrices-and-calculus", [
    ["Matrices", "Rank of a matrix (Echelon, normal form), inverse by Gauss-Jordan, system of linear equations, homogeneous and non-homogeneous systems, Gauss elimination, Gauss-Seidel iteration"],
    ["Eigen Values and Eigen Vectors", "Linear and orthogonal transformation, eigenvalues, eigenvectors, diagonalization of a matrix, Cayley-Hamilton theorem, quadratic forms, reduction to canonical form by orthogonal transformation"],
    ["Calculus", "Mean value theorems (Rolle's, Lagrange's, Cauchy's), Taylor's series, applications of definite integrals to surface areas and volumes of revolution, improper integrals, Beta and Gamma functions"],
    ["Multivariable Calculus (Partial Differentiation)", "Limit and continuity, partial differentiation, Euler's theorem, total derivative, Jacobian, maxima and minima of functions of two/three variables, Lagrange multipliers"],
    ["Multivariable Calculus (Integration)", "Double integrals (Cartesian and polar), change of order of integration, triple integrals, change of variables, areas and volumes by double and triple integrals"],
  ]),
  ...unitsOf("r22-cse-1-1-engineering-chemistry", [
    ["Water and its Treatment", "Hardness of water, complexometric estimation, potable water specifications and treatment, chlorination, defluoridation, boiler troubles (sludges, scales, caustic embrittlement), calgon/phosphate/colloidal conditioning, ion-exchange softening, desalination, reverse osmosis"],
    ["Battery Chemistry & Corrosion", "Primary, secondary and reserve batteries, Zn-air and Li-ion batteries, fuel cells (methanol-oxygen, solid oxide), solar cells, corrosion causes and theories, galvanic/water-line/pitting corrosion, cathodic protection"],
    ["Polymeric Materials", "Classification of polymers, addition and condensation polymerization, Nylon 6:6, Terylene, thermoplastics and thermosetting plastics, PVC, Bakelite, Teflon, FRP, rubbers (Buna-S, Butyl, Thiokol), conducting and biodegradable polymers"],
    ["Energy Sources", "Calorific value, HCV, LCV, coal analysis, petroleum refining, cracking, knocking, octane and cetane rating, Fischer-Tropsch process, natural gas, LPG, CNG, biodiesel"],
    ["Engineering Materials", "Portland cement composition, setting and hardening, smart materials, shape memory materials, thermoresponsive materials, lubricants (classification, mechanism, properties)"],
  ]),
  ...unitsOf("r22-cse-1-1-programming-for-problem-solving", [
    ["Introduction to Programming", "Compilers, compiling and executing a program, algorithms and flowcharts, structured programming, C basics: variables, data types, operators, expressions, storage classes, type conversion, bitwise operators, conditional branching, loops, scanf/printf, command line arguments"],
    ["Arrays, Strings, Structures and Pointers", "One and two dimensional arrays, strings and string functions, structures, unions, array of structures, pointers, pointers to arrays and structures, self-referential structures, enumeration data type"],
    ["Preprocessor and File Handling in C", "Preprocessor commands (include, define, undef, ifdef), text and binary files, creating, reading, writing and appending files, structures with binary files, random access with fseek, ftell, rewind"],
    ["Functions and Dynamic Memory Allocation", "Function design, declaration, signature, parameters, call by value and call by reference, passing arrays and pointers, recursion and its limitations, dynamic memory allocation"],
    ["Searching and Sorting", "Linear and binary search, bubble, insertion and selection sort, basic concept of order of complexity through example programs"],
  ]),
  ...unitsOf("r22-cse-1-1-basic-electrical-engineering", [
    ["D.C. Circuits", "Circuit elements (R, L, C), voltage and current sources, KVL and KCL, analysis of circuits with dc excitation, superposition, Thevenin and Norton theorems, time-domain analysis of first-order RL and RC circuits"],
    ["A.C. Circuits", "Sinusoidal waveforms, peak and rms values, phasor representation, power factor, single-phase R, L, C, RL, RC, RLC series and parallel circuits, resonance in series RLC, three-phase balanced circuits, star and delta connections"],
    ["Transformers", "Ideal and practical transformer, equivalent circuit, losses, regulation and efficiency, auto-transformer, three-phase transformer connections"],
    ["Electrical Machines", "DC machine construction and working, characteristics of dc shunt machine, rotating magnetic field, three-phase induction motor, torque-slip characteristics, single-phase induction motor, synchronous generator"],
    ["Electrical Installations", "LT switchgear components (SFU, MCB, ELCB, MCCB), wires and cables, earthing, batteries, energy consumption calculations, power factor improvement, battery backup"],
  ]),
  ...unitsOf("r22-cse-1-1-computer-aided-engineering-graphics", [
    ["Introduction to Engineering Graphics", "Principles of engineering graphics, plain and diagonal scales, conic sections, rectangular hyperbola, cycloid, epicycloid, hypocycloid, introduction to computer aided drafting"],
    ["Orthographic Projections", "Principles and conventions, projections of points, lines and plane figures, auxiliary planes, computer aided orthographic projections"],
    ["Projections and Sections of Solids", "Projections of regular solids (prism, cylinder, pyramid, cone), auxiliary views, sectional views of right regular solids, computer aided projections and sectional views"],
    ["Development of Surfaces", "Development of surfaces of right regular solids (prism, cylinder, pyramid, cone), development using computer aided drafting"],
    ["Isometric Projections", "Isometric projection principles, isometric scale, isometric views of lines, planes and solids, non-isometric lines, spherical parts, conversion between isometric and orthographic views"],
  ]),
  ...unitsOf("r22-cse-1-1-elements-of-computer-science-and-engineering", [
    ["Basics of a Computer", "Hardware, software, generations of computers, functional units, CPU components, memory hierarchy and types, input and output devices, systems software, application software, packages, frameworks, IDEs"],
    ["Software Development", "Waterfall model, Agile, types of computer languages (programming, markup, scripting), program development steps, flowcharts, algorithms, data structures definition and types"],
    ["Operating Systems & DBMS", "Functions and types of operating systems, device and resource management, data models, RDBMS, SQL, database transactions, data centers, cloud services"],
    ["Computer Networks & Security", "Advantages of networks, LAN, WAN, MAN, internet, WiFi, sensor and vehicular networks, 5G, World Wide Web, HTML, CSS, XML, social media, information security, cyber security, cyber laws"],
    ["Autonomous Systems", "IoT, robotics, drones, artificial intelligence, machine learning, game development, natural language processing, image and video processing, cloud basics"],
  ]),

  // ------------------------------------------------------------ I Year II Sem
  ...unitsOf("r22-cse-1-2-ordinary-differential-equations-and-vector-calculus", [
    ["First Order ODE", "Exact differential equations, equations reducible to exact form, linear and Bernoulli's equations, orthogonal trajectories, Newton's law of cooling, law of natural growth and decay"],
    ["Ordinary Differential Equations of Higher Order", "Second order linear ODEs with constant coefficients, non-homogeneous terms, method of variation of parameters, Legendre's and Cauchy-Euler equations, electric circuits applications"],
    ["Laplace Transforms", "Laplace transform of standard functions, shifting theorems, unit step and Dirac delta functions, transforms of derivatives and integrals, periodic functions, inverse Laplace transform, convolution theorem, solving initial value problems"],
    ["Vector Differentiation", "Vector and scalar point functions, gradient, divergence, curl, directional derivatives, tangent plane and normal line, vector identities, scalar potential, solenoidal and irrotational vectors"],
    ["Vector Integration", "Line, surface and volume integrals, theorems of Green, Gauss and Stokes and their applications"],
  ]),
  ...unitsOf("r22-cse-1-2-applied-physics", [
    ["Quantum Physics and Solids", "Blackbody radiation, Planck's radiation law, photoelectric effect, Davisson-Germer experiment, Heisenberg uncertainty principle, Schrodinger wave equation, particle in a box, free electron theory, Fermi-Dirac distribution, Bloch's theorem, Kronig-Penney model, E-K diagram, energy bands"],
    ["Semiconductors and Devices", "Intrinsic and extrinsic semiconductors, Hall effect, direct and indirect band gap, P-N junction diode, Zener diode, BJT, LED, PIN diode, avalanche photodiode, solar cells"],
    ["Dielectric, Magnetic and Energy Materials", "Polarizations, ferroelectric, piezoelectric and pyroelectric materials, LCD, crystal oscillators, hysteresis, soft and hard magnetic materials, magnetostriction, superionic conductors, supercapacitors, rechargeable batteries, solid fuel cells"],
    ["Nanotechnology", "Nanoscale, quantum confinement, surface to volume ratio, bottom-up fabrication (sol-gel, precipitation, combustion), top-down fabrication (ball milling, PVD, CVD), characterization techniques (XRD, SEM, TEM), applications"],
    ["Laser and Fiber Optics", "Laser beam characteristics, Einstein coefficients, ruby, He-Ne, CO2, argon ion, Nd:YAG and semiconductor lasers, optical fiber construction, total internal reflection, acceptance angle, numerical aperture, fiber types and losses, optical communication"],
  ]),
  ...unitsOf("r22-cse-1-2-english-for-skill-enhancement", [
    ["Toasted English (R.K. Narayan)", "Vocabulary: word formation, prefixes and suffixes, synonyms and antonyms; Grammar: articles and prepositions; Reading: techniques for effective reading; Writing: sentence structures, phrases and clauses, punctuation, paragraph writing"],
    ["Appro JRD (Sudha Murthy)", "Vocabulary: misspelt words, homophones, homonyms, homographs; Grammar: noun-pronoun and subject-verb agreement; Reading: skimming and scanning; Writing: describing people, objects, places and events, classifying, examples"],
    ["Lessons from Online Learning", "Vocabulary: confused words, foreign words in English; Grammar: misplaced modifiers and tenses; Reading: intensive and extensive reading; Writing: formal letters, email etiquette, job application with CV"],
    ["Art and Literature (Abdul Kalam)", "Vocabulary: standard abbreviations; Grammar: redundancies and cliches; Reading: SQ3R method; Writing: essay writing, introduction and conclusion, precis writing"],
    ["Go, Kiss the World (Subroto Bagchi)", "Vocabulary: technical vocabulary; Grammar: common errors in English; Reading: comprehension; Writing: technical reports, characteristics, categories, formats and structure of reports"],
  ]),
  ...unitsOf("r22-cse-1-2-electronic-devices-and-circuits", [
    ["Diodes", "Diode static and dynamic resistances, equivalent circuit, diffusion and transition capacitances, V-I characteristics, diode as a switch, switching times"],
    ["Diode Applications", "Half wave, full wave and bridge rectifiers, capacitive and inductive filters, clippers (clipping at two independent levels), clamping circuit theorem, clamping operation, types of clampers"],
    ["Bipolar Junction Transistor (BJT)", "Principle of operation, common emitter, common base and common collector configurations, transistor as a switch, switching times"],
    ["Junction Field Effect Transistor (FET)", "Construction, principle of operation, pinch-off voltage, V-I characteristics, comparison of BJT and FET, FET as voltage variable resistor, MOSFET"],
    ["Special Purpose Devices", "Zener diode characteristics and voltage regulator, SCR, tunnel diode, UJT, varactor diode, photodiode, solar cell, LED, Schottky diode"],
  ]),
  ...unitsOf("r22-cse-1-2-environmental-science", ES_UNITS),

  // ------------------------------------------------------------ II Year I Sem
  ...unitsOf("r22-cse-2-1-digital-electronics", [
    ["Boolean Algebra and Logic Gates", "Digital systems, binary numbers, number base conversions, octal and hexadecimal numbers, complements, signed binary numbers, binary codes, binary storage and registers, Boolean algebra axioms, theorems, Boolean functions, canonical and standard forms, digital logic gates"],
    ["Gate-Level Minimization", "The map method, four-variable and five-variable maps, product of sums simplification, don't-care conditions, NAND and NOR implementation, two-level implementations, exclusive-OR function"],
    ["Combinational Logic", "Combinational circuits, analysis and design procedure, binary adder-subtractor, decimal adder, binary multiplier, magnitude comparator, decoders, encoders, multiplexers, HDL for combinational circuits"],
    ["Sequential Logic", "Sequential circuits, latches, flip-flops, analysis of clocked sequential circuits, state reduction and assignment, design procedure, registers, shift registers, ripple counters, synchronous counters"],
    ["Memories and Asynchronous Sequential Logic", "Random-access memory, memory decoding, error detection and correction, ROM, PLA, PAL, sequential programmable devices, asynchronous sequential logic, state and flow tables, race-free state assignment, hazards"],
  ]),
  ...unitsOf("r22-cse-2-1-data-structures", [
    ["Lists, Stacks and Queues", "Introduction to data structures, abstract data types, linear list, singly linked list implementation, insertion, deletion and searching, stacks (operations, array and linked representations, applications), queues (operations, array and linked representations)"],
    ["Dictionaries and Hashing", "Dictionaries: linear list and skip list representation; hash table representation, hash functions, collision resolution, separate chaining, open addressing (linear probing, quadratic probing, double hashing), rehashing, extendible hashing"],
    ["Search Trees", "Binary search trees (definition, implementation, searching, insertion, deletion), B-Trees, B+ Trees, AVL trees (height, insertion, deletion, searching), Red-Black trees, splay trees"],
    ["Graphs and Sorting", "Graph implementation methods, graph traversal methods, sorting: quick sort, heap sort, external sorting model, merge sort"],
    ["Pattern Matching and Tries", "Pattern matching algorithms: brute force, Boyer-Moore, Knuth-Morris-Pratt; standard tries, compressed tries, suffix tries"],
  ]),
  ...unitsOf("r22-cse-2-1-computer-oriented-statistical-methods", [
    ["Probability", "Sample space, events, counting sample points, probability of an event, additive rules, conditional probability, independence, product rule, Bayes' rule, random variables, discrete and continuous probability distributions"],
    ["Expectation and Discrete Distributions", "Mean and variance of a random variable, covariance, means and variances of linear combinations, Chebyshev's theorem, binomial distribution, Poisson distribution"],
    ["Continuous and Sampling Distributions", "Uniform distribution, normal distribution, areas under the normal curve, normal approximation to binomial, random sampling, sampling distributions, sampling distribution of means, central limit theorem, t-distribution, F-distribution"],
    ["Sample Estimation & Tests of Hypotheses", "Statistical inference, classical methods of estimation, estimating the mean, prediction intervals, estimating proportions and variances, statistical hypotheses, tests on means, proportions and variances (one and two samples)"],
    ["Stochastic Processes and Markov Chains", "Stochastic processes, Markov process, transition probability and transition probability matrix, first order and higher order Markov process, n-step transition probabilities, Markov chain, steady state condition, Markov analysis"],
  ]),
  ...unitsOf("r22-cse-2-1-computer-organization-and-architecture", [
    ["Basic Computer Organization", "Digital computers, block diagram, computer organization vs architecture, register transfer language and micro-operations, bus and memory transfers, arithmetic/logic/shift micro-operations, instruction codes, computer registers, timing and control, instruction cycle, memory reference instructions, input-output and interrupt"],
    ["Microprogrammed Control and CPU", "Control memory, address sequencing, microprogram example, design of control unit, general register organization, instruction formats, addressing modes, data transfer and manipulation, program control"],
    ["Data Representation and Computer Arithmetic", "Data types, complements, fixed and floating point representation, addition and subtraction, multiplication and division algorithms, floating-point arithmetic operations, decimal arithmetic unit"],
    ["Input-Output and Memory Organization", "I/O interface, asynchronous data transfer, modes of transfer, priority interrupt, DMA, memory hierarchy, main memory, auxiliary memory, associative memory, cache memory"],
    ["RISC, Pipelining and Multiprocessors", "CISC and RISC characteristics, parallel processing, pipelining, arithmetic and instruction pipeline, RISC pipeline, vector processing, array processor, multiprocessor characteristics, interconnection structures, interprocessor arbitration, cache coherence"],
  ]),
  ...unitsOf("r22-cse-2-1-object-oriented-programming-through-java", [
    ["OOP and Java Basics", "Need for OOP paradigm, OOP concepts, abstraction, history of Java, Java buzzwords, data types, variables, arrays, operators, control statements, type conversion and casting, classes, objects, constructors, methods, access control, this keyword, garbage collection, overloading, inheritance, overriding, parameter passing, recursion, nested and inner classes, String class"],
    ["Inheritance, Packages and Interfaces", "Hierarchical abstractions, base class object, subclass, subtype, substitutability, forms of inheritance, member access rules, super, final with inheritance, polymorphism, method overriding, abstract classes, Object class, packages, CLASSPATH, interfaces, java.io"],
    ["Exception Handling and Multithreading", "Exception handling concepts, exception hierarchy, try, catch, throw, throws, finally, built-in and custom exceptions, string handling, java.util, multithreading vs multitasking, thread life cycle, creating threads, priorities, synchronization, inter-thread communication, daemon threads, enumerations, autoboxing, annotations, generics"],
    ["Event Handling and AWT", "Events, event sources, listeners, delegation event model, mouse and keyboard events, adapter classes, AWT class hierarchy, labels, buttons, canvas, scrollbars, text components, check box, lists, panels, dialogs, menubar, graphics, layout managers (border, grid, flow, card, grid bag)"],
    ["Applets and Swing", "Applet concepts, applets vs applications, applet life cycle, passing parameters, Swing: MVC architecture, JApplet, JFrame, JComponent, icons, labels, text fields, JButton, check boxes, radio buttons, combo boxes, tabbed panes, scroll panes, trees, tables"],
  ]),

  // ----------------------------------------------------------- II Year II Sem
  ...unitsOf("r22-cse-2-2-discrete-mathematics", [
    ["Mathematical Logic", "Statements and notation, connectives, normal forms, theory of inference for the statement calculus, predicate calculus, inference theory of the predicate calculus"],
    ["Set Theory", "Basic concepts of set theory, representation of discrete structures, relations and ordering, functions"],
    ["Algebraic Structures", "Algebraic systems, semi groups and monoids, lattices as partially ordered sets, Boolean algebra"],
    ["Elementary Combinatorics", "Basics of counting, combinations and permutations, enumeration with repetitions, permutations with constrained repetitions, binomial coefficient, binomial and multinomial theorems, principle of exclusion"],
    ["Graph Theory", "Basic concepts, isomorphism and subgraphs, trees and their properties, spanning trees, directed trees, binary trees, planar graphs, Euler's formula, multi-graphs and Euler circuits, Hamiltonian graphs, chromatic numbers, four-color problem"],
  ]),
  ...unitsOf("r22-cse-2-2-business-economics-and-financial-analysis", [
    ["Introduction to Business and Economics", "Structure of business firm, theory of firm, types of business entities, limited liability companies, sources of capital, micro and macro economics, national income, inflation, money supply, business cycle, nature and scope of business economics"],
    ["Demand and Supply Analysis", "Elasticity of demand, types of elasticity, law of demand, measurement and significance of elasticity, factors affecting elasticity, demand forecasting methods, determinants of supply, supply function, law of supply"],
    ["Production, Cost, Market Structures & Pricing", "Factors of production, production function, returns to scale, types of costs, short run and long run cost functions, perfect competition, monopoly, oligopoly, monopolistic competition, types of pricing, product life cycle pricing, break even analysis, cost volume profit analysis"],
    ["Financial Accounting", "Accounting concepts and conventions, accounting equation, double-entry system, journal, ledger, trial balance, elements of financial statements, preparation of final accounts"],
    ["Financial Ratios Analysis", "Concept of ratio analysis, importance and types of ratios, liquidity ratios, turnover ratios, profitability ratios, proprietary ratios, solvency and leverage ratios, analysis and interpretation"],
  ]),
  ...unitsOf("r22-cse-2-2-operating-systems", [
    ["Introduction and Processes", "Operating system structures, simple batch, multiprogrammed, time-shared, parallel, distributed and real-time systems, system components, OS services, system calls, process concepts and scheduling, operations on processes, cooperating processes, threads"],
    ["CPU Scheduling and Deadlocks", "Scheduling criteria and algorithms, multiple-processor scheduling, system calls for process management (fork, exit, wait, waitpid, exec), deadlock characterization, prevention, avoidance, detection and recovery"],
    ["Process Synchronization and IPC", "Critical section problem, synchronization hardware, semaphores, classical problems of synchronization, critical regions, monitors, interprocess communication, pipes, FIFOs, message queues, shared memory"],
    ["Memory Management and Virtual Memory", "Logical vs physical address space, swapping, contiguous allocation, paging, segmentation, segmentation with paging, demand paging, page replacement algorithms"],
    ["File System Interface", "Access methods, directory structure, protection, file system structure, allocation methods, free-space management, file-related system calls (open, read, write, lseek, stat, ioctl)"],
  ]),
  ...unitsOf("r22-cse-2-2-database-management-systems", [
    ["Introduction to Databases and ER Model", "Database system applications, file systems vs DBMS, data model, levels of abstraction, data independence, structure of a DBMS, database design and ER diagrams, entities, attributes, entity sets, relationships, relationship sets, additional features of the ER model, conceptual design"],
    ["Relational Model, Algebra and Calculus", "Integrity constraints over relations, enforcing integrity constraints, querying relational data, logical database design, views, relational algebra, tuple relational calculus, domain relational calculus"],
    ["SQL and Schema Refinement (Normalization)", "Basic SQL query, UNION, INTERSECT, EXCEPT, nested queries, aggregation operators, NULL values, integrity constraints in SQL, triggers, active databases, problems caused by redundancy, decompositions, functional dependencies, normalization, first, second, third normal forms, BCNF, lossless join decomposition, multivalued dependencies, 4NF, 5NF"],
    ["Transactions and Concurrency Control", "Transaction concept and states, atomicity and durability, concurrent executions, serializability, recoverability, isolation, testing for serializability, lock based protocols, timestamp based protocols, validation based protocols, multiple granularity, log-based recovery, recovery with concurrent transactions"],
    ["Storage and Indexing", "Data on external storage, file organization and indexing, cluster indexes, primary and secondary indexes, index data structures, hash based indexing, tree based indexing, comparison of file organizations, ISAM, B+ trees"],
  ]),
  ...unitsOf("r22-cse-2-2-software-engineering", [
    ["Introduction and Process Models", "Evolving role of software, changing nature of software, software myths, software engineering as a layered technology, process framework, CMMI, waterfall model, spiral model, agile methodology"],
    ["Software Requirements", "Functional and non-functional requirements, user requirements, system requirements, interface specification, software requirements document, feasibility studies, requirements elicitation and analysis, validation, management"],
    ["Design Engineering", "Design process and quality, design concepts, design model, software architecture, data design, architectural styles and patterns, UML, structural modeling, class diagrams, sequence diagrams, collaboration diagrams, use case diagrams, component diagrams"],
    ["Testing Strategies and Metrics", "Strategic approach to software testing, test strategies for conventional software, black-box and white-box testing, validation testing, system testing, debugging, software measurement, metrics for software quality"],
    ["Risk and Quality Management", "Reactive vs proactive risk strategies, risk identification, projection, refinement, RMMM, quality concepts, software quality assurance, software reviews, formal technical reviews, statistical SQA, software reliability, ISO 9000"],
  ]),

  // ----------------------------------------------------------- III Year I Sem
  ...unitsOf("r22-cse-3-1-design-and-analysis-of-algorithms", [
    ["Introduction and Divide and Conquer", "Algorithm, performance analysis, space and time complexity, asymptotic notations (Big-oh, Omega, Theta, Little-oh), divide and conquer general method, binary search, quick sort, merge sort, Strassen's matrix multiplication"],
    ["Disjoint Sets, Heaps and Backtracking", "Disjoint set operations, union and find algorithms, priority queues, heaps, heapsort, backtracking general method, n-queens problem, sum of subsets, graph coloring, Hamiltonian cycles"],
    ["Dynamic Programming", "General method, optimal binary search tree, 0/1 knapsack problem, all pairs shortest path problem, traveling salesperson problem, reliability design"],
    ["Greedy Method and Graph Traversals", "Greedy general method, job sequencing with deadlines, knapsack problem, minimum cost spanning trees, single source shortest path, traversal and search techniques for binary trees and graphs, connected components, biconnected components"],
    ["Branch and Bound, NP-Hard and NP-Complete", "Branch and bound general method, traveling salesperson problem, 0/1 knapsack (LC and FIFO branch and bound), non-deterministic algorithms, NP-Hard and NP-Complete classes, Cook's theorem"],
  ]),
  ...unitsOf("r22-cse-3-1-computer-networks", [
    ["Network Fundamentals, Physical and Data Link Layers", "Network hardware and software, OSI and TCP/IP reference models, ARPANET, Internet, guided transmission media (twisted pair, coaxial, fiber optics), wireless transmission, data link layer design issues, framing, error detection and correction"],
    ["Data Link Protocols and MAC Sublayer", "Simplex protocols, stop-and-wait (error-free and noisy channels), sliding window protocols, one-bit sliding window, Go-Back-N, selective repeat, channel allocation problem, ALOHA, CSMA, collision-free protocols, wireless LANs, data link layer switching"],
    ["Network Layer", "Design issues, routing algorithms (shortest path, flooding, hierarchical, broadcast, multicast, distance vector), congestion control algorithms, quality of service, internetworking, network layer in the internet"],
    ["Transport Layer", "Transport services, elements of transport protocols, connection management, TCP and UDP protocols"],
    ["Application Layer", "Domain name system (DNS), SNMP, electronic mail, the World Wide Web, HTTP, streaming audio and video"],
  ]),
  ...unitsOf("r22-cse-3-1-devops", [
    ["Introduction to DevOps", "Agile development model, DevOps and ITIL, DevOps process and continuous delivery, release management, Scrum, Kanban, delivery pipeline, identifying bottlenecks"],
    ["Software Development Models and DevOps Architecture", "DevOps lifecycle for business agility, continuous testing, influence on architecture, monolithic scenario, architecture rules of thumb, separation of concerns, handling database migrations, microservices and the data tier, resilience"],
    ["Project Management and Source Code Control", "Need for source code control, history of SCM, roles and code, SCM systems and migrations, shared authentication, hosted Git servers, Git server implementations, Docker, Gerrit, pull request model, GitLab"],
    ["Integrating the System (CI)", "Build systems, Jenkins build server, managing build dependencies, Jenkins plugins, host server, build slaves, triggers, job chaining and build pipelines, infrastructure as code, building by dependency order, build phases, alternative build servers, collating quality measures"],
    ["Testing Tools and Deployment", "Types of testing, automation of testing pros and cons, Selenium, JavaScript testing, backend integration points, test-driven development, deployment systems, virtualization stacks, Puppet, Ansible, Chef, SaltStack, Docker"],
  ]),

  // ---------------------------------------------------------- III Year II Sem
  ...unitsOf("r22-cse-3-2-machine-learning", [
    ["Concept Learning and Linear Models", "Types of machine learning, supervised learning, the brain and the neuron, design a learning system, perspectives and issues in ML, concept learning task, concept learning as search, finding a maximally specific hypothesis, version spaces, candidate elimination algorithm, linear discriminants, perceptron, linear separability, linear regression"],
    ["Neural Networks and SVMs", "Multi-layer perceptron, back propagation error, MLP in practice, deriving back-propagation, radial basis functions and splines, RBF network, curse of dimensionality, interpolations and basis functions, support vector machines"],
    ["Trees, Ensembles and Unsupervised Learning", "Decision trees, constructing decision trees, classification and regression trees, ensemble learning, boosting, bagging, combining classifiers, basic statistics, Gaussian mixture models, nearest neighbor methods, unsupervised learning, K-means algorithm"],
    ["Dimensionality Reduction and Evolutionary Learning", "Linear discriminant analysis, principal component analysis, factor analysis, independent component analysis, locally linear embedding, Isomap, least squares optimization, genetic algorithms, genetic operators"],
    ["Reinforcement Learning and Graphical Models", "Reinforcement learning overview, Markov chain Monte Carlo methods, sampling, proposal distribution, graphical models, Bayesian networks, Markov random fields, hidden Markov models, tracking methods"],
  ]),
  ...unitsOf("r22-cse-3-2-formal-languages-and-automata-theory", [
    ["Finite Automata", "Structural representations, automata and complexity, alphabets, strings, languages, problems, nondeterministic finite automata, text search, epsilon transitions, deterministic finite automata, language of a DFA, conversion of NFA to DFA, Moore and Mealy machines"],
    ["Regular Expressions and Languages", "Finite automata and regular expressions, applications, algebraic laws, conversion of finite automata to regular expressions, pumping lemma for regular languages, closure properties, decision properties, equivalence and minimization of automata"],
    ["Context-Free Grammars and Pushdown Automata", "Definition of CFG, derivations, leftmost and rightmost derivations, language of a grammar, sentential forms, parse trees, ambiguity, pushdown automata, languages of a PDA, equivalence of PDAs and CFGs, acceptance by final state and empty stack, deterministic PDA"],
    ["Normal Forms, CFL Properties and Turing Machines", "Eliminating useless symbols and epsilon productions, Chomsky normal form, Greibach normal form, pumping lemma for context-free languages, closure and decision properties of CFLs, Turing machines, formal description, instantaneous description, language of a Turing machine"],
    ["Turing Machines and Undecidability", "Types of Turing machines, halting problem, a language that is not recursively enumerable, undecidable problems about Turing machines, recursive languages, Post's correspondence problem, modified PCP, counter machines"],
  ]),
  ...unitsOf("r22-cse-3-2-artificial-intelligence", [
    ["Introduction and Search Strategies", "Intelligent agents, problem-solving agents, searching for solutions, uninformed search (BFS, uniform cost, DFS, iterative deepening, bidirectional), heuristic search (greedy best-first, A*), heuristic functions, hill-climbing, simulated annealing, local search in continuous spaces"],
    ["Adversarial Search, CSPs and Propositional Logic", "Games, optimal decisions in games, alpha-beta pruning, imperfect real-time decisions, constraint satisfaction problems, backtracking and local search for CSPs, knowledge-based agents, Wumpus world, propositional logic, theorem proving, resolution, Horn clauses, forward and backward chaining"],
    ["First-Order Logic and Inference", "Representation, syntax and semantics of first-order logic, using FOL, knowledge engineering in FOL, propositional vs first-order inference, unification and lifting, forward chaining, backward chaining, resolution"],
    ["Knowledge Representation and Planning", "Ontological engineering, categories and objects, events, reasoning systems for categories, default reasoning, classical planning definition, state-space search planning, planning graphs, analysis of planning approaches"],
    ["Uncertainty and Probabilistic Reasoning", "Acting under uncertainty, basic probability notation, inference using full joint distributions, independence, Bayes' rule, Bayesian networks, efficient representation of conditional distributions, approximate inference, relational and first-order probability, Dempster-Shafer theory"],
  ]),
  ...unitsOf("r22-cse-3-2-environmental-science", ES_UNITS),

  // ----------------------------------------------------------- IV Year I Sem
  ...unitsOf("r22-cse-4-1-cryptography-and-network-security", [
    ["Security Concepts and Classical Cryptography", "Need for security, security approaches, principles of security, types of security attacks, security services and mechanisms, model for network security, plain text and cipher text, substitution and transposition techniques, encryption and decryption, symmetric and asymmetric key cryptography, steganography, key range and key size"],
    ["Symmetric and Asymmetric Ciphers", "Block cipher principles, DES, AES, Blowfish, RC5, IDEA, block cipher operation, stream ciphers, RC4, principles of public key cryptosystems, RSA, Elgamal, Diffie-Hellman key exchange, knapsack algorithm"],
    ["Hash Functions, MACs and Key Management", "Message authentication, SHA-512, HMAC, CMAC, digital signatures, Elgamal digital signature scheme, symmetric key distribution, distribution of public keys, Kerberos, X.509 authentication service, public key infrastructure"],
    ["Transport-Level and Wireless Security", "Web security considerations, SSL and TLS, HTTPS, SSH, wireless network security, mobile device security, IEEE 802.11 and 802.11i wireless LAN security"],
    ["E-Mail and IP Security", "Pretty Good Privacy, S/MIME, IP security overview and architecture, authentication header, encapsulating security payload, security associations, internet key exchange, case studies (secure multiparty computation, virtual elections, single sign-on, secure inter-branch payment, cross-site scripting)"],
  ]),
  ...unitsOf("r22-cse-4-1-compiler-design", [
    ["Introduction and Lexical Analysis", "Structure of a compiler, science of building a compiler, programming language basics, role of the lexical analyzer, input buffering, recognition of tokens, Lex, finite automata, regular expressions to automata, design of a lexical-analyzer generator, optimization of DFA-based pattern matchers"],
    ["Syntax Analysis", "Context-free grammars, writing a grammar, top-down parsing, bottom-up parsing, LR parsing, simple LR, more powerful LR parsers, using ambiguous grammars, parser generators"],
    ["Syntax-Directed Translation and Intermediate Code Generation", "Syntax-directed definitions, evaluation orders for SDDs, applications, translation schemes, L-attributed SDDs, variants of syntax trees, three-address code, types and declarations, type checking, control flow, switch-statements, intermediate code for procedures"],
    ["Run-Time Environments and Code Generation", "Stack allocation, access to nonlocal data, heap management, garbage collection, trace-based collection, issues in code generator design, target language, addresses in target code, basic blocks and flow graphs, optimization of basic blocks, simple code generator, peephole optimization, register allocation"],
    ["Machine-Independent Optimization", "Principal sources of optimization, introduction to data-flow analysis, foundations of data-flow analysis, constant propagation, partial-redundancy elimination, loops in flow graphs"],
  ]),

  // ---------------------------------------------------------- IV Year II Sem
  ...unitsOf("r22-cse-4-2-organizational-behavior", [
    ["Introduction to Organizational Behaviour", "Definition, need and importance of organizational behaviour, nature and scope, framework, organizational behaviour models"],
    ["Individual Behaviour", "Personality types and factors, theories, learning process and theories, organizational behaviour modification, misbehaviour, emotions, emotional intelligence, attitudes, values, perception, impression management, motivation"],
    ["Group Behaviour", "Organization structure, groups in organizations, group dynamics, informal leaders and working norms, group decision making techniques, team building, interpersonal relations, communication, control"],
    ["Leadership and Power", "Leadership meaning and importance, leadership styles, theories of leadership, leaders vs managers, sources of power, power centers, power and politics"],
    ["Dynamics of Organizational Behaviour", "Organizational culture and climate, job satisfaction, organizational change, resistance to change, managing change, stress and work stressors, balancing work and life, organizational development, organizational effectiveness"],
  ]),
];
