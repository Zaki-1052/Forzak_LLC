class m{constructor(){this.cache=new Map}async loadContent(t){var e;try{console.log(`🔄 Starting to load content: ${t}`);const o=`/src/content/${t}.md`;console.log(`📡 Fetching from URL: ${o}`);const n=await fetch(o);if(console.log("📡 Fetch response:",{ok:n.ok,status:n.status,statusText:n.statusText,url:n.url,headers:Object.fromEntries(n.headers.entries())}),!n.ok)throw console.error(`❌ Fetch failed with status ${n.status}: ${n.statusText}`),new Error(`Failed to fetch ${t}.md: ${n.status} ${n.statusText}`);const i=await n.text();console.log("📄 Raw markdown loaded:",{length:i.length,preview:i.substring(0,300)+"...",firstLine:i.split(`
`)[0]}),console.log("⚙️ Parsing markdown content...");const s=this.parseMarkdown(i);return console.log("✅ Parsed content:",{frontmatter:s.frontmatter,rawContentLength:((e=s.rawContent)==null?void 0:e.length)||0}),console.log(`✅ Basic parsing complete for: ${t}`),s}catch(o){throw console.error(`❌ Failed to load content: ${t}`,{message:o.message,stack:o.stack,name:o.name}),o}}parseMarkdown(t){console.log("🔍 Raw markdown input:",t.substring(0,100));const e=/^---\s*\n([\s\S]*?)\n-+\s*\n([\s\S]*)$/,o=t.match(e);let n={},i=t;if(o){console.log("✅ Frontmatter match found");const s=o[1];i=o[2],console.log("📋 Frontmatter text:",s),console.log("📄 Content after frontmatter:",i.substring(0,100)),n=this.parseFrontmatter(s)}else{console.log("❌ No frontmatter match found");const s=/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/,r=t.match(s);r&&(console.log("✅ Alternative frontmatter pattern matched"),n=this.parseFrontmatter(r[1]),i=r[2])}return{frontmatter:n,rawContent:i}}parseFrontmatter(t){const e={};return t.split(`
`).forEach(n=>{if(n=n.trim(),n&&!n.startsWith("#")){const i=n.indexOf(":");if(i>0){const s=n.substring(0,i).trim();let r=n.substring(i+1).trim();r=r.replace(/^["']|["']$/g,""),e[s]=r}}}),e}markdownToHtml(t){const e=t.trim().split(/\n\s*\n/);let o="";return e.forEach(n=>{const i=n.trim();if(i)if(i.includes(`
-`)||i.startsWith("-")){const s=i.split(`
`).filter(r=>r.trim().startsWith("-")).map(r=>`<li><span class="custom-bullet">▸</span>${r.replace(/^-\s*/,"").trim()}</li>`).join("");s&&(o+=`<ul class="custom-list">${s}</ul>`)}else{let s=i.replace(/^#### (.*$)/gim,'<h4 class="text-lg font-bold text-primary mb-3 font-heading">$1</h4>').replace(/^### (.*$)/gim,'<h3 class="text-xl font-bold text-primary mb-4 font-heading">$1</h3>').replace(/^## (.*$)/gim,'<h2 class="text-2xl font-bold text-primary mb-6 font-heading">$1</h2>').replace(/^# (.*$)/gim,'<h1 class="text-3xl font-bold text-primary mb-6 font-heading">$1</h1>').replace(/\*\*(.*?)\*\*/gim,"<strong>$1</strong>").replace(/\*(.*?)\*/gim,"<em>$1</em>");s.includes("<h1>")||s.includes("<h2>")||s.includes("<h3>")||s.includes("<h4>")?o+=s:o+=`<p class="text-neutral-800 mb-4 font-body leading-relaxed text-lg">${s}</p>`}}),o}applyContentStyling(t){return t}escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}renderContent(t,e){if(!t){console.error("Container element not found");return}t.innerHTML=e}showLoading(t){t&&(t.innerHTML=`
                <div class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span class="ml-3 text-neutral-600">Loading content...</span>
                </div>
            `)}showError(t,e="Failed to load content"){t&&(t.innerHTML=`
                <div class="text-center py-12">
                    <div class="text-red-600 mb-2">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <p class="text-neutral-600">${e}</p>
                </div>
            `)}}class v extends m{parseContentSections(t){console.log("📝 Parsing content sections from:",t.substring(0,200));const e={mainContent:"",personnel:[],services:[],industries:[],other:[],servicesMainDescription:"",coreValues:[],serviceAreas:[]};if(t.includes("### Forzak Will Do More for Your Business")||t.includes("### Core Values"))return console.log("🛠️ Detected services content, using specialized parsing"),this.parseServicesContent(t);const n=/^## (.+)$/gm,i=t.split(n);if(console.log("📂 Content split into",i.length,"parts"),i.forEach((r,l)=>{console.log(`📄 Part ${l}:`,r.substring(0,100))}),i[0]){const l=i[0].trim().replace(/^#\s+[^\n]+\n*/,"");!l.trim()&&i.length>2?(console.log("📄 No intro content found, using first section as main content"),e.firstSectionTitle=i[1].trim(),e.mainContent=this.markdownToHtml(i[2].trim()),e.skipFirstSection=!0):e.mainContent=this.markdownToHtml(l),console.log("📄 Main content set:",e.mainContent.substring(0,100))}let s=e.skipFirstSection?3:1;for(let r=s;r<i.length;r+=2){const l=i[r],a=i[r+1]||"";console.log(`🏷️ Processing section: "${l}"`),console.log("📄 Section content preview:",a.substring(0,150)),l.toLowerCase().includes("personnel")?(console.log("👥 Found personnel section!"),e.personnel=this.parsePersonnel(a)):l.toLowerCase().includes("services")?(console.log("🛠️ Found services section!"),e.services=this.parseServices(a)):a.includes("### Industries we have invested in:")?(console.log("🏭 Found section with industries list"),e.other.push({title:l,content:this.parseInvestmentSectionWithIndustries(a),hasIndustries:!0})):(console.log("📋 Adding to other sections:",l),e.other.push({title:l,content:this.markdownToHtml(a.trim())}))}return console.log("📊 Final sections summary:",{mainContentLength:e.mainContent.length,personnelCount:e.personnel.length,servicesCount:e.services.length,otherSections:e.other.map(r=>r.title)}),e}parseServicesContent(t){console.log("🛠️ Parsing specialized services content");const e={mainContent:"",servicesMainDescription:"",coreValues:[],serviceAreas:[],other:[]},o=t.match(/### Forzak Will Do More for Your Business\s*\n\n([^#]*?)(?=###|##|$)/s);o&&(e.servicesMainDescription=this.markdownToHtml(o[1].trim()),console.log("✅ Found main description:",e.servicesMainDescription.substring(0,100)));const n=/### (Core Values|Creativity & Rigour|Relationship Driven|Objective Advice)\s*\n\n((?:(?!###|##)[\s\S])*)/g;let i;for(;(i=n.exec(t))!==null;){const r=i[1],l=i[2].trim();e.coreValues.push({title:r,content:this.markdownToHtml(l)}),console.log("✅ Found core value section:",r)}const s=t.split(/^## /gm);for(let r=1;r<s.length;r++){const a=s[r].split(`
`),c=a[0].trim(),d=a.slice(1).join(`
`).trim();c!=="Market Leading Advisory Firm"&&(console.log(`📋 Processing service area: "${c}"`),console.log(`📄 Raw content length: ${d.length}`),console.log(`📄 Content preview: ${d.substring(0,200)}...`),e.serviceAreas.push({title:c,content:this.markdownToHtml(d),rawContent:d}),console.log("✅ Found service area:",c))}return console.log("🛠️ Services parsing complete:",{mainDescriptionLength:e.servicesMainDescription.length,coreValuesCount:e.coreValues.length,serviceAreasCount:e.serviceAreas.length}),e}parsePersonnel(t){console.log("👥 Parsing personnel from content length:",t.length),console.log("👥 Personnel content preview:",t.substring(0,300));const e=[],n=t.replace(/\\\s*\n/g," ").trim().split(/(?=\*\*[^*]+\*\*\s*[–—-])/);console.log("👥 Found",n.length,"potential personnel entries");for(const i of n){if(!i.trim()||!i.includes("**"))continue;console.log("👤 Processing entry:",i.substring(0,150));const s=i.match(/\*\*([^*]+)\*\*\s*[–—-]\s*([^\n]+)/);if(!s){console.log("👤 No name/title match found");continue}const r=s[1].trim(),l=s[2].trim(),d=i.split(`
`).slice(1).filter(p=>p.trim()).join(`
`).trim();console.log("👤 Extracted:",{name:r,title:l,bioLength:d.length,bioPreview:d.substring(0,100)});const g=d?this.markdownToHtml(d).replace(/<p><\/p>/g,"").trim():"";r&&l&&(e.push({name:r,title:l,bio:g}),console.log("✅ Added personnel:",{name:r,title:l,bioPreview:g.substring(0,50)}))}return console.log("👥 Total personnel found:",e.length),e}parseServices(t){const e=[],o=/^### (.+)$/gm,n=t.split(o);for(let i=1;i<n.length;i+=2){const s=n[i],r=n[i+1]||"";e.push({title:s.trim(),content:this.markdownToHtml(r.trim())})}return e}parseInvestmentSectionWithIndustries(t){console.log("🏭 Parsing investment section with industries");const e=t.split(/### Industries we have invested in:/i);if(e.length<2)return this.markdownToHtml(t);let o=this.markdownToHtml(e[0].trim());o+='<h3 class="text-xl font-bold text-primary mb-6 font-heading">Industries we have invested in:</h3>';const n=e[1],i=[],s=/^[-*]\s+(.+)$/gm;let r;for(;(r=s.exec(n))!==null;){const a=r[1].trim();a&&i.push(a)}i.length>0&&(o+='<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">',i.forEach(a=>{o+=`
                    <div class="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                        <p class="text-sm text-neutral-800 font-body">${this.escapeHtml(a)}</p>
                    </div>
                `}),o+="</div>");const l=n.replace(s,"").trim();return l&&(o+=this.markdownToHtml(l)),o}extractIndustries(t){console.log("🏭 Extracting industries from content...");const e=[],o=t.match(/### Industries we have invested in:\s*((?:\s*-\s*.+\s*)+)/i);if(o){console.log("🎯 Found industries section:",o[1]);const r=o[1],l=/^[-*]\s+(.+)$/gm;let a;for(;(a=l.exec(r))!==null;){const c=a[1].trim();c&&e.push(c)}return console.log("🏭 Extracted industries:",e),e}console.log("⚠️ No specific industries section found, trying fallback...");const n=/^[-*]\s+(.+)$/gm;let i,s=[];for(;(i=n.exec(t))!==null;)s.push(i[1].trim());return s.length>10?(console.log("🏭 Using fallback industries list:",s),s):(console.log("⚠️ No industries found"),e)}}class f extends m{generatePersonnelCards(t){if(t.length===0)return"";let e=`
            <h3 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Key Personnel</h3>
            <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
        `;return t.forEach(o=>{e+=`
                <div class="personnel-card bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <!-- Photo Area -->
                        <div class="lg:col-span-1">
                            <div class="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                                <svg class="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Info Area -->
                        <div class="lg:col-span-3">
                            <h4 class="text-2xl font-bold text-primary mb-2 font-heading">
                                ${o.name==="Sameer Alibhai"?`<a href="https://www.linkedin.com/in/sameer-alibhai-0b878321/" target="_blank" rel="noopener noreferrer" class="hover:text-secondary transition-colors">${this.escapeHtml(o.name)}</a>`:this.escapeHtml(o.name)}
                            </h4>
                            <p class="text-xl text-accent-gold font-semibold mb-4 font-heading">${this.escapeHtml(o.title)}</p>
                            <div class="text-neutral-800 leading-relaxed font-body space-y-4">${o.bio}</div>
                        </div>
                    </div>
                </div>
            `}),e+="</div>",e}generateServicesSection(t){console.log("🛠️ Generating services section, available sections:",Object.keys(t));let e=t.other.find(s=>s.title.toLowerCase().includes("services"));if(!e&&t.services&&t.services.length>0)return console.log("🛠️ Found services in sections.services array"),this.generateServicesFromArray(t.services);if(!e)return console.warn("⚠️ No services section found"),"";console.log("🛠️ Found services section:",e.title);let o=`
            <h2 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        `;const n=e.content;console.log("🛠️ Services content to parse:",n.substring(0,200));const i=n.split(/<h3[^>]*>/);console.log("🛠️ Split into",i.length,"service sections");for(let s=1;s<i.length;s++){const r=i[s],l=r.match(/^([^<]+)</),a=l?l[1].trim():"";console.log("🛠️ Processing service section:",a);const c=r.match(/<ul[^>]*>(.*?)<\/ul>/s);let d="";c?(d=c[1],console.log("🔍 Found list items for",a,":",d)):(console.log("❌ No list match found for",a),console.log("🔍 Section content:",r.substring(0,300)));const g=this.formatServiceList(d);console.log("🎨 Formatted list for",a,":",g),o+=`
                <div class="service-category bg-white p-8 rounded-lg shadow-md">
                    <h3 class="text-2xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(a)}</h3>
                    <ul class="custom-list">
                        ${g}
                    </ul>
                </div>
            `}return o+="</div>",o}generateServicesFromArray(t){let e=`
            <h2 class="text-3xl font-bold text-primary mb-12 font-heading text-center">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        `;return t.forEach(o=>{console.log("🔧 Processing service from array:",o.title),console.log("🔧 Service content:",o.content);let n=[];const i=o.content.match(/<ul[^>]*class="custom-list"[^>]*>(.*?)<\/ul>/s);if(i){const r=i[1],l=/<li[^>]*><span[^>]*class="custom-bullet"[^>]*>▸<\/span>(.*?)<\/li>/g;let a;for(;(a=l.exec(r))!==null;)n.push(a[1].trim());console.log("🔧 Extracted bullets from HTML list for",o.title,":",n)}if(n.length===0){const r=/<p>-\s*(.+?)<\/p>/g;let l;for(;(l=r.exec(o.content))!==null;)n.push(l[1].trim());console.log("🔧 Extracted bullets from paragraphs for",o.title,":",n)}let s="";n.forEach(r=>{s+=`<li><span class="custom-bullet">▸</span>${this.escapeHtml(r)}</li>`}),e+=`
                <div class="service-category bg-white p-8 rounded-lg shadow-md">
                    <h3 class="text-2xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(o.title)}</h3>
                    <ul class="custom-list">
                        ${s}
                    </ul>
                </div>
            `}),e+="</div>",e}formatServiceList(t){if(!t)return console.log("⚠️ formatServiceList: No list items provided"),"";console.log("🔧 formatServiceList input:",t);const e=t.replace(/<li[^>]*>/g,"<li>").replace(/<li>/g,'<li><span class="custom-bullet">▸</span>');return console.log("🎨 formatServiceList output:",e),e}}class b extends m{constructor(){super()}generateCoreValuesSection(t){console.log("💎 Generating core values section, available sections:",Object.keys(t));let e=[];if(t.coreValues&&t.coreValues.length>0?(e=t.coreValues,console.log("✅ Using specialized coreValues sections:",e.length)):(e=t.other.filter(n=>n.title.toLowerCase().includes("values")||n.title.toLowerCase().includes("creativity")||n.title.toLowerCase().includes("relationship")||n.title.toLowerCase().includes("objective")),console.log("🔄 Using fallback core values sections:",e.length)),e.length===0)return console.warn("⚠️ No core values sections found"),"";let o=`
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        `;return e.forEach((n,i)=>{const s=['<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>'];o+=`
                <div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                    <div class="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${s[i%s.length]}
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-primary mb-3 font-heading">${this.escapeHtml(n.title)}</h3>
                    <div class="text-sm text-neutral-800 font-body text-left">${n.content}</div>
                </div>
            `}),o+="</div>",o}generateServicesSections(t){console.log("🛠️ Generating services sections, available sections:",Object.keys(t));let e=[];if(t.serviceAreas&&t.serviceAreas.length>0?(e=t.serviceAreas,console.log("✅ Using specialized serviceAreas sections:",e.length)):(e=t.other.filter(n=>n.title.toLowerCase().includes("management consulting")||n.title.toLowerCase().includes("corporate restructuring")||n.title.toLowerCase().includes("mergers")||n.title.toLowerCase().includes("strategic advisory")||n.title.toLowerCase().includes("sell side")||n.title.toLowerCase().includes("buy-side")||n.title.toLowerCase().includes("corporate structure")),console.log("🔄 Using fallback service sections:",e.length)),e.length===0)return console.warn("⚠️ No service sections found"),"";let o="";return e.forEach((n,i)=>{const s=n.title.toLowerCase().includes("management consulting"),r=n.title.toLowerCase().includes("mergers");if(s){const l=n.rawContent||"",a=this.parseManagementConsultingSubsections(l);console.log("🔍 Management Consulting - Raw content preview:",l.substring(0,500)),console.log("🔍 Management Consulting - Found subsections:",a.length),o+=`
                    <div class="mb-12">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-8">
                            <div>
                                <h3 class="text-3xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(n.title)}</h3>
                                <div class="text-neutral-800 font-body">${this.getManagementConsultingIntro(n.content)}</div>
                                ${a.length>0?'<h2 class="text-2xl font-bold text-primary mt-20 font-heading">Our services include:</h2>':""}
                            </div>
                            <div>
                                <div class="aspect-[3/2] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                                    <img src="/assets/img/meeting.png" 
                                         alt="Professional business consultation meeting - executive in dark suit gesturing during strategic discussion" 
                                         class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300">
                                </div>
                            </div>
                        </div>
                `,a.length>0?(o+=`
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    `,a.forEach(c=>{o+=`
                            <div class="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h4 class="text-xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(c.title)}</h4>
                                <div class="text-neutral-800 font-body">${c.content}</div>
                            </div>
                        `}),o+="</div>"):console.warn("⚠️ No Management Consulting subsections found - debugging needed"),o+="</div>"}else if(r){const l=n.content,a=n.rawContent||"",c=this.parseMergersAcquisitionsSubsections(l,a);o+=`
                    <div class="mb-12">
                        <h3 class="text-3xl font-bold text-primary mb-8 text-center font-heading">${this.escapeHtml(n.title)}</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                `,c.forEach(d=>{o+=`
                        <div class="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h4 class="text-xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(d.title)}</h4>
                            <div class="text-neutral-800 font-body">${d.content}</div>
                        </div>
                    `}),o+="</div></div>"}else n.title.toLowerCase().includes("risk management")?o+=`
                    <div class="mb-8">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h3 class="text-3xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(n.title)}</h3>
                                <div class="text-neutral-800 font-body">${n.content}</div>
                            </div>
                            <div class="lg:col-span-1">
                                <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                    <img src="/assets/img/graphs.png" 
                                         alt="Risk management analytics with graphs and charts showing financial data and performance metrics" 
                                         class="w-full h-full object-cover object-center">
                                </div>
                            </div>
                        </div>
                    </div>
                `:o+=`
                    <div class="mb-8">
                        <div class="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h3 class="text-3xl font-bold text-primary mb-6 font-heading">${this.escapeHtml(n.title)}</h3>
                            <div class="text-neutral-800 font-body">${n.content}</div>
                        </div>
                    </div>
                `}),o}parseManagementConsultingSubsections(t){const e=[];console.log("🔍 MC Parsing - Full raw content LENGTH:",t.length),console.log("🔍 MC Parsing - Full raw content:",t),console.log('🔍 Raw content contains "Competitive Strategy"?',t.includes("Competitive Strategy")),console.log('🔍 Raw content contains "#### Competitive Strategy"?',t.includes("#### Competitive Strategy"));const o="### Our services include:",n=t.indexOf(o);if(console.log("🔍 Looking for start marker at index:",n),n===-1)return console.log('⚠️ No "Our services include:" section found'),e;const i=t.substring(n+o.length).trim();console.log("🔍 Extracted content length:",i.length),console.log("🔍 Does extracted content include Competitive Strategy?",i.includes("#### Competitive Strategy")),console.log("📋 Found services include section LENGTH:",i.length),console.log("📋 Found services include section FULL CONTENT:",i),console.log('📋 Does it contain "Competitive Strategy"?',i.includes("Competitive Strategy")),console.log('📋 Does it contain "#### Competitive Strategy"?',i.includes("#### Competitive Strategy"));const s=i.split("#### ");console.log(`🔍 Split into ${s.length} parts`),console.log("🔍 All split parts:",s);for(let r=1;r<s.length;r++){const l=s[r].trim();if(!l)continue;const a=l.split(`
`),c=a[0].trim(),d=a.slice(1).join(`
`).trim();console.log(`🎯 Found MC subsection: "${c}"`),console.log(`📄 Subsection content: ${d.substring(0,100)}...`),c&&d&&e.push({title:c,content:this.markdownToHtml(d)})}return console.log(`📊 Total MC subsections found: ${e.length}`),e.forEach((r,l)=>{console.log(`📋 Subsection ${l+1}: ${r.title}`)}),e}getManagementConsultingIntro(t){const e=t.match(/<p[^>]*>(.*?)<\/p>/);return e?e[0]:t}parseMergersAcquisitionsSubsections(t,e){const o=[];console.log("🔍 Parsing M&A subsections from raw content:",e.substring(0,300));const n=/^### (.+?)\s*\n([\s\S]*?)(?=^###|^##|$)/gm;let i;for(;(i=n.exec(e))!==null;){const s=i[1].trim(),r=i[2].trim();console.log(`🎯 Found M&A subsection: "${s}"`),console.log(`📄 Subsection content length: ${r.length}`),s&&r&&o.push({title:s,content:this.markdownToHtml(r)})}return console.log(`📊 Total M&A subsections found: ${o.length}`),o.length===0&&(console.log("⚠️ No M&A subsections found, using fallback"),o.push({title:"Our Approach",content:t})),o}}class w extends m{generateInvestmentSections(t){if(console.log("📋 Generating investment sections, available sections:",Object.keys(t)),console.log("📋 Sections to render:",t.other.map(l=>({title:l.title,hasIndustries:l.hasIndustries}))),t.other.length===0)return console.warn("⚠️ No sections found"),"";let e='<div class="space-y-12">';const o=t.other.findIndex(l=>l.title.toLowerCase().includes("backing")),n=t.other.findIndex(l=>l.title.toLowerCase().includes("personal invitation")),i=t.other.findIndex(l=>l.title.toLowerCase().includes("financing needs")),s=o!==-1&&n!==-1&&i!==-1,r=s?[o,n,i].sort((l,a)=>l-a):[];return t.other.forEach((l,a)=>{const c=a%2===0?"bg-white":"bg-neutral-50";l.hasIndustries?(console.log("🏭 Rendering section with industries grid:",l.title),e+=`
                    <div class="${c} rounded-lg p-8">
                        <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(l.title)}</h2>
                        <div class="text-neutral-800 font-body">
                            ${l.content}
                        </div>
                    </div>
                `):s&&a===r[0]?(console.log("🥽 Starting special layout with vertical images for sections:",r),e+=this.generateSpecialSectionsWithImages(t,r)):(!s||!r.includes(a))&&(e+=`
                    <div class="${c} rounded-lg p-8">
                        <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(l.title)}</h2>
                        <div class="text-neutral-800 font-body">
                            ${l.content}
                        </div>
                    </div>
                `)}),e+="</div>",e}generateSpecialSectionsWithImages(t,e){const n=[{filename:"glass.png",alt:"Financial analysis with magnifying glass over charts and graphs showing investment opportunities and market data"},{filename:"pen.png",alt:"Professional business pen and documents representing contract signing and deal closure"},{filename:"suit.png",alt:"Professional business attire representing expertise and trustworthiness"}].filter(s=>s.filename==="glass.png"||s.filename==="pen.png"||s.filename==="suit.png");console.log("🖼️ Available vertical images:",n.map(s=>s.filename));let i=`
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 space-y-8">
        `;return e.forEach((s,r)=>{const l=t.other[s],a=s%2===0?"bg-white":"bg-neutral-50";let c=this.escapeHtml(l.title);l.title.toLowerCase().includes("backing")&&l.title.includes("–")&&(c=c.replace("–&nbsp;","–<br>").replace("– ","–<br>")),i+=`
                <div class="${a} rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 class="text-2xl font-bold text-primary mb-4 font-heading">${c}</h2>
                    <div class="text-neutral-800 font-body">
                        ${l.content}
                    </div>
                </div>
            `}),i+=`
                </div>
                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
        `,n.forEach((s,r)=>{i+=`
                <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <img src="/assets/img/${s.filename}" 
                         alt="${s.alt}" 
                         class="w-full h-full object-cover object-center">
                </div>
            `}),i+=`
                    </div>
                </div>
            </div>
        `,i}generateInvestmentServicesSection(t){console.log("💼 Generating investment services section, available sections:",Object.keys(t)),console.log("📋 Other sections available:",t.other.map(i=>i.title));const e=t.other.filter(i=>{const s=i.title.toLowerCase();return s==="private equity"||s==="private placements"||s==="management buyouts"||s==="financial restructuring"||s==="debtor-in-possession financing"||s==="real estate development financing"||s.includes("asset based financing")});if(console.log("✅ Found investment sections:",e.map(i=>i.title)),e.length===0)return console.warn("⚠️ No investment service sections found"),"";let o=`
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                Our Investment Services
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        `;const n=['<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"></path>'];return e.forEach((i,s)=>{o+=`
                <div class="bg-white p-8 rounded-lg shadow-sm">
                    <div class="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${n[s%n.length]}
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(i.title)}</h3>
                    <div class="text-neutral-800 font-body">${i.content}</div>
                </div>
            `}),o+="</div>",o}generateIndustryCards(t){let e="";return t.forEach(o=>{e+=`
                <div class="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                    <p class="text-sm text-neutral-800 font-body">${this.escapeHtml(o)}</p>
                </div>
            `}),e}generateFinancialProductsSection(t){return console.log("💳 Generating financial products section, available sections:",Object.keys(t)),console.log("💳 Skipping financial products section to avoid duplication"),""}}class u extends m{constructor(){super()}generateInvestmentSolutionsGrid(t){console.log("💎 Generating investment solutions grid, available sections:",Object.keys(t)),console.log("📋 All sections.other:",t.other.map(s=>s.title));const e=["private equity","private placements","management buyouts","financial restructuring"],o=t.other.filter(s=>{const r=s.title.toLowerCase();return r!=="tailored financial solutions for your business"&&s.title!==""&&e.some(l=>r.includes(l))});if(console.log("✅ Found core investment services for cards:",o.map(s=>s.title)),o.length===0)return console.warn("⚠️ No investment services found"),"";let n=`
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                Our Core Investment Solutions
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        `;const i=['<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>'];return o.forEach((s,r)=>{const l=s.content.match(/<p[^>]*>(.*?)<\/p>/);let a="";l?a=`<p class="text-neutral-800 mb-4 font-body leading-relaxed text-lg">${(l[1].match(/[^.!?]+[.!?]+/g)||[]).slice(0,2).join(" ")}</p>`:a=s.content,n+=`
                <div class="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div class="flex items-start mb-6">
                        <div class="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${i[r%i.length]}
                            </svg>
                        </div>
                        <div class="ml-6 flex-1">
                            <h3 class="text-2xl font-bold text-primary mb-4 font-heading">${this.escapeHtml(s.title)}</h3>
                            <div class="text-neutral-800 font-body">
                                ${a}
                                <a href="#${s.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}" 
                                   class="inline-block mt-4 text-secondary hover:text-primary font-semibold transition-colors smooth-scroll">
                                    Learn More →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `}),n+="</div>",n+='<div class="mt-16 space-y-16">',o.forEach((s,r)=>{const l=s.title.toLowerCase().replace(/[^a-z0-9]+/g,"-");n+=`
                <div id="${l}" class="scroll-mt-24">
                    <div class="bg-white rounded-lg shadow-md p-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    ${i[r%i.length]}
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-primary font-heading">${this.escapeHtml(s.title)}</h3>
                        </div>
                        <div class="text-neutral-800 font-body">
                            ${s.content}
                        </div>
                    </div>
                </div>
            `}),n+="</div>",n}generateSpecializedFinancingServices(t){console.log("💼 Generating specialized financing services, available sections:",Object.keys(t)),console.log("📋 All sections.other:",t.other.map(s=>s.title));const e=["debtor-in-possession financing","real estate development financing","asset based financing"],o=t.other.filter(s=>{const r=s.title.toLowerCase();return e.some(l=>r.includes(l)||l==="asset based financing"&&r.includes("when you need more than a bank"))});if(console.log("✅ Found specialized financing services:",o.map(s=>s.title)),o.length===0)return console.warn("⚠️ No specialized financing services found"),"";let n=`
            <h2 class="text-3xl font-bold text-primary text-center mb-12 font-heading">
                Specialized Financing Services
            </h2>
            <div class="space-y-12">
        `;const i=['<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>','<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>'];return o.forEach((s,r)=>{const l=r%2===0?"bg-white":"bg-neutral-50";n+=`
                <div class="${l} rounded-lg shadow-md p-8 md:p-12 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group cursor-pointer">
                    <div class="flex items-start mb-6">
                        <div class="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 mr-4 transition-colors duration-300 group-hover:bg-primary/20">
                            <svg class="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${i[r%i.length]}
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-primary font-heading">${this.escapeHtml(s.title)}</h3>
                    </div>
                    <div class="text-neutral-800 font-body">
                        ${s.content}
                    </div>
                </div>
            `}),n+="</div>",n}}new u;class x{constructor(){this.core=new m,this.shared=new v,this.about=new f,this.services=new b,this.investments=new w,this.solutions=new u,this.cache=this.core.cache,this.parseMarkdown=this.core.parseMarkdown.bind(this.core),this.parseFrontmatter=this.core.parseFrontmatter.bind(this.core),this.markdownToHtml=this.core.markdownToHtml.bind(this.core),this.applyContentStyling=this.core.applyContentStyling.bind(this.core),this.escapeHtml=this.core.escapeHtml.bind(this.core),this.renderContent=this.core.renderContent.bind(this.core),this.showLoading=this.core.showLoading.bind(this.core),this.showError=this.core.showError.bind(this.core),this.parseContentSections=this.shared.parseContentSections.bind(this.shared),this.parseServicesContent=this.shared.parseServicesContent.bind(this.shared),this.parsePersonnel=this.shared.parsePersonnel.bind(this.shared),this.parseServices=this.shared.parseServices.bind(this.shared),this.parseInvestmentSectionWithIndustries=this.shared.parseInvestmentSectionWithIndustries.bind(this.shared),this.extractIndustries=this.shared.extractIndustries.bind(this.shared),this.generatePersonnelCards=this.about.generatePersonnelCards.bind(this.about),this.generateServicesSection=this.about.generateServicesSection.bind(this.about),this.generateServicesFromArray=this.about.generateServicesFromArray.bind(this.about),this.formatServiceList=this.about.formatServiceList.bind(this.about),this.generateCoreValuesSection=this.services.generateCoreValuesSection.bind(this.services),this.generateServicesSections=this.services.generateServicesSections.bind(this.services),this.parseManagementConsultingSubsections=this.services.parseManagementConsultingSubsections.bind(this.services),this.getManagementConsultingIntro=this.services.getManagementConsultingIntro.bind(this.services),this.parseMergersAcquisitionsSubsections=this.services.parseMergersAcquisitionsSubsections.bind(this.services),this.generateInvestmentSections=this.investments.generateInvestmentSections.bind(this.investments),this.generateSpecialSectionsWithImages=this.investments.generateSpecialSectionsWithImages.bind(this.investments),this.generateInvestmentServicesSection=this.investments.generateInvestmentServicesSection.bind(this.investments),this.generateIndustryCards=this.investments.generateIndustryCards.bind(this.investments),this.generateFinancialProductsSection=this.investments.generateFinancialProductsSection.bind(this.investments),this.generateInvestmentSolutionsGrid=this.solutions.generateInvestmentSolutionsGrid.bind(this.solutions),this.generateSpecializedFinancingServices=this.solutions.generateSpecializedFinancingServices.bind(this.solutions),this.parseInvestments=this.parseInvestments.bind(this)}async loadContent(t){if(this.cache.has(t))return this.cache.get(t);try{const e=await this.core.loadContent(t),o=this.shared.parseContentSections(e.rawContent),n={frontmatter:e.frontmatter,sections:o,rawContent:e.rawContent};return this.cache.set(t,n),console.log(`💾 Full content cached for: ${t}`),n}catch(e){throw console.error(`❌ Failed to load content: ${t}`,e),e}}parseInvestments(t){const e=document.createElement("div");e.innerHTML=t;const o={sections:[],industries:[]};return e.querySelectorAll("ul").forEach(s=>{const r=s.querySelectorAll("li");r.length>10&&r.forEach(l=>{o.industries.push(l.textContent.trim())})}),e.querySelectorAll("h2").forEach(s=>{const r=s.textContent.trim();let l="",a=s.nextElementSibling;for(;a&&a.tagName!=="H2";)l+=a.outerHTML,a=a.nextElementSibling;o.sections.push({title:r,content:l})}),o}}const S=new x;export{x as ContentLoader,S as contentLoader};
//# sourceMappingURL=contentLoader-B0hQA329.js.map
