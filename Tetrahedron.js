class Tetrahedron {
    constructor() {
        this.type = 'tertrahedron';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.vertices = null;
        this.verts = null;
        this.textureVerts = null;
        this.textureNum = COLOR;
    }

    generateVertices() {
        var height = Math.sqrt(2) / Math.sqrt(3);
        var back = -Math.sqrt(3)/2;
        if (this.vertices === null) {
            this.vertices = [
                // Base
                [0, 0, 0,  1, 0, 0,  0.5, 0, back], 
    
                // Front
                [0, 0, 0,  0.5, height, -1/3,  1, 0, 0],
    
                // Left
                [0, 0, 0,  0.5, 0, back,  0.5, height, -1/3],
    
                // Right
                [0.5, 0, back,  1, 0, 0,  0.5, height, -1/3]
            ];
        }
        if(this.verts === null) {
            this.verts = [
                // Base
                0, 0, 0,  1, 0, 0,  0.5, 0, back, 
    
                // Front
                0, 0, 0,  0.5, height, -1/3,  1, 0, 0,
    
                // Left
                0, 0, 0,  0.5, 0, back,  0.5, height, -1/3,
    
                // Right
                0.5, 0, back,  1, 0, 0,  0.5, height, -1/3
            ];
        }

        if(this.textureVerts === null) {
            this.textureVerts = [
                1,0, 0,1, 0,0,
                1,0, 1,1, 0,1,
        
                0,0, 1,1, 1,0,
                0,0, 1,1, 0,1,        
            ]
        }

    }

    setupBuffer() {
        // Create a buffer object
        if(this.vertexBuffer === null) {
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.DYNAMIC_DRAW);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Position);
        }
        
        // Create a buffer object for UV
        if(this.uvBuffer === null) {
            this.uvBuffer = gl.createBuffer();
            if (!this.uvBuffer) {
                console.log('Failed to create the uvBuffer object');
                return -1;
            }
            
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureVerts), gl.DYNAMIC_DRAW);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_UV);
        }
    }

    render() {
        var rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();

        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
                console.log("Failed to create the buffer object");
                return;
            }
        }

        // Shading levels
        const shading = [1.0, 0.8, 0.6];
        const faceColors = [
            [rgba[0] * shading[0], rgba[1] * shading[0], rgba[2] * shading[0], rgba[3]],
            [rgba[0] * shading[1], rgba[1] * shading[1], rgba[2] * shading[1], rgba[3]],
            [rgba[0] * shading[2], rgba[1] * shading[2], rgba[2] * shading[2], rgba[3]]
        ];

        // Draw each face with different shading levels
        gl.uniform4f(u_FragColor, ...faceColors[2]);
        drawTriangle3D(this.vertices[0], this.buffer); // Base

        gl.uniform4f(u_FragColor, ...faceColors[0]); // Front
        drawTriangle3D(this.vertices[1], this.buffer);

        gl.uniform4f(u_FragColor, ...faceColors[1]);
        drawTriangle3D(this.vertices[2], this.buffer); // Left and Right
        drawTriangle3D(this.vertices[3], this.buffer);
    }


    renderfaster() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();
        
        var n = 12; // The number of vertices
        
        this.setupBuffer();
        
        //return n;
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}