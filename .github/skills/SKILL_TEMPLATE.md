# Agent Skill Template

> **Fuente de la verdad**: [VS Code - Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)  
> **Estándar**: [agentskills.io](https://agentskills.io/)

Esta plantilla te ayuda a crear nuevas **Agent Skills** para GitHub Copilot en VS Code. Las skills son carpetas con instrucciones, scripts y recursos que Copilot carga automáticamente cuando son relevantes para realizar tareas especializadas.

## 📋 Estructura de una Skill

```
.github/skills/
└── your-skill-name/
    ├── SKILL.md           # Archivo principal (requerido)
    ├── script.sh          # Scripts opcionales
    ├── template.txt       # Plantillas opcionales
    └── examples/          # Ejemplos opcionales
        └── example.md
```

---

## 📝 Plantilla de SKILL.md

Copia este contenido en tu nuevo archivo `SKILL.md`:

````markdown
---
name: skill-name
description: Brief description of what the skill does and when to use it. Be specific about capabilities and use cases to help Copilot decide when to load the skill. Maximum 1024 characters.
---

# Skill Title

Brief overview of what this skill accomplishes and why it's useful.

## When to Use This Skill

Use this skill when the user requests:

✅ **Primary Use Cases**

- "Describe specific user request pattern"
- "Another user request example"
- "Common task description"

✅ **Secondary Use Cases**

- "Related task 1"
- "Related task 2"

❌ **Do NOT use when**

- Condition or scenario where this skill is not appropriate
- Prerequisites not met
- Alternative skill should be used instead

## Prerequisites

List any tools, configurations, or conditions required before using this skill:

### 1. Tool Installation

Check if tool is installed:

```bash
tool-name --version
```
````

Installation commands:

- **Windows**: `winget install tool-name`
- **macOS**: `brew install tool-name`
- **Linux**: `apt install tool-name`

### 2. Configuration

```bash
# Setup commands
tool-name config --set option value
```

### 3. Validation Checks

```bash
# Verify environment is ready
command-to-check-status
```

---

## Step-by-Step Instructions

### Step 1: Preparation

Describe what to do first and why:

```bash
# Example command with explanation
command arg1 arg2
```

Expected output:

```
Sample output showing success
```

### Step 2: Main Action

Provide clear, actionable instructions:

1. **Action description**: Explain what this step does

   ```bash
   command-example
   ```

2. **Next action**: Continue with details
   ```bash
   another-command --flag value
   ```

### Step 3: Validation

Verify the outcome:

```bash
# Check results
validation-command
```

**Success criteria**: What indicates this step completed correctly

**Troubleshooting**:

- If error X occurs: do Y
- If condition Z: try alternative approach

---

## Advanced Usage

### Option 1: Alternative Approach

When to use this approach and how it differs from the main workflow.

```bash
# Alternative command
alternative-command --option
```

### Option 2: Complex Scenario

Handle edge cases or advanced requirements:

```bash
# Multi-step complex operation
step1-command && step2-command
```

---

## Examples

### Example 1: Common Scenario

**User request**: "Typical user question or command"

**Actions**:

```bash
# Command 1 with context
example-command --input file.txt

# Command 2
next-command --output result.json
```

**Expected result**: Description of successful outcome

### Example 2: Edge Case

**Scenario**: Specific situation requiring special handling

**Solution**:

```bash
# Adapted approach
special-command --flag
```

---

## Reference Files

You can reference files within the skill directory:

- [Script Template](./script-template.sh) - Reusable script for automation
- [Configuration Example](./examples/config-example.yaml) - Sample configuration
- [Advanced Guide](./docs/advanced.md) - Additional documentation

---

## Error Handling

### Common Errors

| Error           | Cause          | Solution         |
| --------------- | -------------- | ---------------- |
| Error message 1 | Why it happens | How to fix       |
| Error message 2 | Root cause     | Resolution steps |

### Debugging Tips

```bash
# Enable verbose output
command --verbose --debug

# Check logs
cat /path/to/logs
```

---

## Best Practices

1. **Always verify before destructive operations**: Check status, confirm with user
2. **Use idempotent commands when possible**: Can be run multiple times safely
3. **Provide clear feedback**: Explain what each step accomplishes
4. **Handle failures gracefully**: Include rollback or recovery steps

---

## Related Skills

- [other-skill-name](./../other-skill-name/SKILL.md) - When to use this instead
- [complementary-skill](./../complementary-skill/SKILL.md) - Can be combined with this skill

---

## Resources

- [Official Documentation](https://example.com/docs)
- [API Reference](https://example.com/api)
- [Community Examples](https://github.com/example/repo)

---

## Notes

Additional context, limitations, or special considerations:

- Note about performance implications
- Note about compatibility requirements
- Note about version-specific behavior

````

---

## 🎯 Reglas para el Header (YAML Frontmatter)

El header debe incluir exactamente estos campos:

| Campo | Requerido | Descripción | Reglas |
|-------|-----------|-------------|--------|
| `name` | ✅ Sí | Identificador único | Lowercase, guiones para espacios, máx. 64 caracteres |
| `description` | ✅ Sí | Descripción de capacidades y casos de uso | Específico y claro, máx. 1024 caracteres |

### ✅ Ejemplos de buenos nombres:

```yaml
name: webapp-testing
name: github-pull-request
name: database-migration
name: api-documentation
````

### ❌ Ejemplos de malos nombres:

```yaml
name: WebApp_Testing  # No usar mayúsculas ni underscores
name: test            # Demasiado genérico
name: this-is-a-very-long-skill-name-that-exceeds-the-maximum-allowed-length  # Muy largo
```

### ✅ Ejemplos de buenas descripciones:

```yaml
description: Creates, updates, and merges GitHub pull requests using GitHub CLI. Handles the complete PR lifecycle including validation, creation, labeling, review, and squash merge. Use when user wants to create a PR, update existing PR, merge with squash, or manage the full PR workflow.
```

### ❌ Ejemplos de malas descripciones:

```yaml
description: Helps with PRs  # Muy vago
description: A skill         # No describe qué hace
```

---

## 🔄 Sistema de Carga Progresiva

Copilot usa un sistema de 3 niveles para cargar skills eficientemente:

### Nivel 1: Descubrimiento

- Copilot **siempre** conoce las skills disponibles leyendo `name` y `description`
- Esta metadata es ligera y ayuda a decidir qué skills son relevantes

### Nivel 2: Carga de Instrucciones

- Cuando la request coincide con la descripción, Copilot carga el body del `SKILL.md`
- Solo entonces las instrucciones detalladas están disponibles

### Nivel 3: Acceso a Recursos

- Copilot puede acceder a archivos adicionales en el directorio (scripts, ejemplos, docs)
- Estos recursos no se cargan hasta que Copilot los referencia

**Beneficio**: Puedes instalar muchas skills sin consumir contexto. Copilot solo carga lo relevante.

---

## 📦 Ubicaciones de Skills

### Skills de Proyecto (Recomendado)

```
.github/skills/          # Recomendado
.claude/skills/          # Legacy, para retrocompatibilidad
```

### Skills Personales

```
~/.copilot/skills/       # Recomendado
~/.claude/skills/        # Legacy, para retrocompatibilidad
```

---

## 📚 Buenas Prácticas

### 1. **Descripción Clara y Específica**

La descripción debe responder:

- ¿Qué hace la skill?
- ¿Cuándo usarla?
- ¿Qué herramientas utiliza?

### 2. **Instrucciones Paso a Paso**

- Usa secciones numeradas
- Incluye comandos exactos
- Explica el resultado esperado

### 3. **Ejemplos Concretos**

- Muestra casos de uso reales
- Incluye input y output esperados
- Cubre escenarios comunes y edge cases

### 4. **Referencias a Recursos**

- Usa rutas relativas: `[script](./script.sh)`
- Organiza archivos relacionados en el mismo directorio
- Documenta cada archivo adicional

### 5. **Manejo de Errores**

- Lista errores comunes
- Proporciona soluciones claras
- Incluye comandos de debugging

---

## 🚀 Proceso de Creación

### 1. Crear directorio de la skill

```bash
mkdir -p .github/skills/your-skill-name
```

### 2. Crear SKILL.md

```bash
# Copiar esta plantilla
cp .github/skills/SKILL_TEMPLATE.md .github/skills/your-skill-name/SKILL.md
```

### 3. Personalizar contenido

- Editar header (name, description)
- Completar secciones del body
- Agregar ejemplos específicos

### 4. Agregar recursos opcionales

```bash
# Scripts
touch .github/skills/your-skill-name/script.sh

# Ejemplos
mkdir .github/skills/your-skill-name/examples
touch .github/skills/your-skill-name/examples/example.md
```

### 5. Habilitar en VS Code

```json
{
  "chat.useAgentSkills": true
}
```

### 6. Probar la skill

- Hacer una request que debería activar la skill
- Verificar que Copilot carga las instrucciones correctas
- Ajustar la descripción si no se activa apropiadamente

---

## 🌐 Skills Compartidas

### Usar skills de la comunidad

1. **Explorar repositorios**:

   - [github/awesome-copilot](https://github.com/github/awesome-copilot)
   - [anthropics/skills](https://github.com/anthropics/skills)

2. **Copiar al proyecto**:

   ```bash
   cp -r /path/to/shared-skill .github/skills/
   ```

3. **Revisar y personalizar**:
   - ⚠️ **IMPORTANTE**: Revisa el contenido antes de usar
   - Verifica requerimientos de seguridad
   - Adapta a las necesidades del proyecto
   - Revisa scripts y comandos que se ejecutarán

---

## 🆚 Skills vs Custom Instructions

| Aspecto          | Skills                                        | Custom Instructions                    |
| ---------------- | --------------------------------------------- | -------------------------------------- |
| **Propósito**    | Capacidades especializadas y workflows        | Estándares de código y guías           |
| **Portabilidad** | VS Code, Copilot CLI, Copilot agent           | Solo VS Code y GitHub.com              |
| **Contenido**    | Instrucciones + scripts + ejemplos + recursos | Solo instrucciones                     |
| **Alcance**      | Específico por tarea, carga bajo demanda      | Siempre aplicado (o via glob patterns) |
| **Estándar**     | Open standard (agentskills.io)                | Específico de VS Code                  |

### Usa Skills cuando necesites:

- ✅ Crear capacidades reutilizables que funcionen en diferentes AI tools
- ✅ Incluir scripts, ejemplos, o recursos junto a instrucciones
- ✅ Compartir capacidades con la comunidad
- ✅ Definir workflows especializados (testing, debugging, deployment)

### Usa Custom Instructions cuando necesites:

- ✅ Definir estándares de código específicos del proyecto
- ✅ Establecer convenciones de lenguaje o framework
- ✅ Especificar guías de code review o commit messages
- ✅ Aplicar reglas basadas en tipos de archivo con glob patterns

---

## 🔗 Referencias

- **Documentación oficial**: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- **Estándar Agent Skills**: https://agentskills.io/
- **Skills de referencia**: https://github.com/anthropics/skills
- **Awesome Copilot**: https://github.com/github/awesome-copilot
- **Custom Instructions**: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- **Custom Agents**: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- **Prompt Files**: https://code.visualstudio.com/docs/copilot/customization/prompt-files

---

## ✅ Checklist de Calidad

Antes de considerar tu skill completa, verifica:

- [ ] Header YAML tiene `name` y `description` válidos
- [ ] Nombre usa lowercase y guiones (max 64 chars)
- [ ] Descripción específica sobre qué hace y cuándo usar (max 1024 chars)
- [ ] Sección "When to Use This Skill" con ejemplos claros
- [ ] Prerrequisitos listados y comandos de verificación
- [ ] Instrucciones paso a paso con comandos ejecutables
- [ ] Ejemplos concretos con input/output esperado
- [ ] Manejo de errores y troubleshooting
- [ ] Referencias a archivos adicionales usan rutas relativas
- [ ] Scripts incluidos son seguros y están documentados
- [ ] Probado en escenarios reales

---

## 💡 Consejos Avanzados

### Optimización de Contexto

- Mantén las instrucciones concisas
- Usa referencias a archivos para contenido extenso
- Estructura en secciones claras

### Activación Automática

- La descripción determina cuándo se activa
- Incluye palabras clave que usuarios podrían usar
- Sé específico para evitar activaciones incorrectas

### Composición de Skills

- Las skills pueden referenciar otras skills
- Crea skills modulares y reutilizables
- Documenta dependencias entre skills

### Testing

- Prueba con diferentes variaciones de requests
- Verifica que se activa en los casos correctos
- Asegura que NO se activa en casos incorrectos

---

## 📄 Ejemplo Mínimo Funcional

````markdown
---
name: example-skill
description: Example skill that demonstrates the minimum required structure. Use when user asks for a simple example or demonstration of skill format.
---

# Example Skill

This skill demonstrates the minimum required structure for a valid Agent Skill.

## When to Use

Use when the user requests:

- "Show me an example skill"
- "Create a minimal skill"

## Instructions

1. **Step 1**: First action
   ```bash
   echo "Hello from skill"
   ```
````

2. **Step 2**: Second action
   ```bash
   echo "Skill completed"
   ```

## Example

**User**: "Run the example"

**Action**:

```bash
echo "Example skill executed"
```

**Result**: Skill demonstrates basic structure successfully.

```

---

## 🎓 Próximos Pasos

1. **Estudia skills existentes**: Revisa [.github/skills/github-pull-request/SKILL.md](./../github-pull-request/SKILL.md)
2. **Identifica necesidades**: ¿Qué tareas repites frecuentemente?
3. **Crea tu primera skill**: Usa esta plantilla
4. **Prueba y refina**: Ajusta basándote en uso real
5. **Comparte**: Considera contribuir a la comunidad

---

*Creado siguiendo la especificación oficial de Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills*
```
