import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class GenerateComponents {
    private static final String BASE_PATH = "src/main/java/com/medistock/medistockbackend/";
    private static final String[] ENTITIES = {
        "Role", "User", "Supplier", "Medicine", "Inventory", 
        "StockLog", "PurchaseOrder", "PurchaseOrderItem", 
        "ExpiryTracking", "Notification", "Report"
    };

    public static void main(String[] args) throws IOException {
        new File(BASE_PATH + "service/impl").mkdirs();
        new File(BASE_PATH + "controller").mkdirs();
        new File(BASE_PATH + "dto").mkdirs();

        for (String entity : ENTITIES) {
            String serviceInterface = BASE_PATH + "service/" + entity + "Service.java";
            String serviceImpl = BASE_PATH + "service/impl/" + entity + "ServiceImpl.java";
            String controller = BASE_PATH + "controller/" + entity + "Controller.java";
            String dto = BASE_PATH + "dto/" + entity + "Dto.java";

            // DTO
            writeFile(dto, 
                "package com.medistock.medistockbackend.dto;\n\n" +
                "import lombok.Data;\n\n" +
                "@Data\n" +
                "public class " + entity + "Dto {\n" +
                "    private Long id;\n" +
                "}\n"
            );

            // Service Interface
            writeFile(serviceInterface, 
                "package com.medistock.medistockbackend.service;\n\n" +
                "import com.medistock.medistockbackend.entity." + entity + ";\n" +
                "import java.util.List;\n\n" +
                "public interface " + entity + "Service {\n" +
                "    List<" + entity + "> findAll();\n" +
                "    " + entity + " findById(Long id);\n" +
                "    " + entity + " save(" + entity + " entity);\n" +
                "    void deleteById(Long id);\n" +
                "}\n"
            );

            // Service Impl
            String varName = entity.substring(0, 1).toLowerCase() + entity.substring(1);
            writeFile(serviceImpl,
                "package com.medistock.medistockbackend.service.impl;\n\n" +
                "import com.medistock.medistockbackend.entity." + entity + ";\n" +
                "import com.medistock.medistockbackend.repository." + entity + "Repository;\n" +
                "import com.medistock.medistockbackend.service." + entity + "Service;\n" +
                "import com.medistock.medistockbackend.exception.ResourceNotFoundException;\n" +
                "import lombok.RequiredArgsConstructor;\n" +
                "import org.springframework.stereotype.Service;\n" +
                "import java.util.List;\n\n" +
                "@Service\n" +
                "@RequiredArgsConstructor\n" +
                "public class " + entity + "ServiceImpl implements " + entity + "Service {\n\n" +
                "    private final " + entity + "Repository repository;\n\n" +
                "    @Override\n" +
                "    public List<" + entity + "> findAll() { return repository.findAll(); }\n\n" +
                "    @Override\n" +
                "    public " + entity + " findById(Long id) {\n" +
                "        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException(\"" + entity + " not found with id: \" + id));\n" +
                "    }\n\n" +
                "    @Override\n" +
                "    public " + entity + " save(" + entity + " entity) { return repository.save(entity); }\n\n" +
                "    @Override\n" +
                "    public void deleteById(Long id) { repository.deleteById(id); }\n" +
                "}\n"
            );

            // Controller
            writeFile(controller,
                "package com.medistock.medistockbackend.controller;\n\n" +
                "import com.medistock.medistockbackend.entity." + entity + ";\n" +
                "import com.medistock.medistockbackend.service." + entity + "Service;\n" +
                "import lombok.RequiredArgsConstructor;\n" +
                "import org.springframework.http.ResponseEntity;\n" +
                "import org.springframework.web.bind.annotation.*;\n" +
                "import java.util.List;\n\n" +
                "@RestController\n" +
                "@RequestMapping(\"/api/" + entity.toLowerCase() + "s\")\n" +
                "@RequiredArgsConstructor\n" +
                "public class " + entity + "Controller {\n\n" +
                "    private final " + entity + "Service service;\n\n" +
                "    @GetMapping\n" +
                "    public ResponseEntity<List<" + entity + ">> getAll() { return ResponseEntity.ok(service.findAll()); }\n\n" +
                "    @GetMapping(\"/{id}\")\n" +
                "    public ResponseEntity<" + entity + "> getById(@PathVariable Long id) { return ResponseEntity.ok(service.findById(id)); }\n\n" +
                "    @PostMapping\n" +
                "    public ResponseEntity<" + entity + "> create(@RequestBody " + entity + " entity) { return ResponseEntity.ok(service.save(entity)); }\n\n" +
                "    @PutMapping(\"/{id}\")\n" +
                "    public ResponseEntity<" + entity + "> update(@PathVariable Long id, @RequestBody " + entity + " entity) {\n" +
                "        entity.setId(id);\n" +
                "        return ResponseEntity.ok(service.save(entity));\n" +
                "    }\n\n" +
                "    @DeleteMapping(\"/{id}\")\n" +
                "    public ResponseEntity<Void> delete(@PathVariable Long id) { service.deleteById(id); return ResponseEntity.ok().build(); }\n" +
                "}\n"
            );
        }
        System.out.println("Generation complete.");
    }

    private static void writeFile(String path, String content) throws IOException {
        File file = new File(path);
        if (!file.exists()) {
            file.getParentFile().mkdirs();
            try (FileWriter writer = new FileWriter(file)) {
                writer.write(content);
            }
        }
    }
}
