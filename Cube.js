class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.textureNum = COLOR;

        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();

        this.buffer = null;
        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.normalBuffer = null;
        
        this.cubeVerts = null;
        this.textureVerts = null;
        this.normalVerts = null;
    }

    generateVertices() {
        if(this.cubeVerts === null) {
            this.cubeVerts = [
                0,0,0,  1,1,0,  1,0,0,
                0,0,0,  0,1,0,  1,1,0,

                0,1,0, 1,1,-1, 0,1,-1,
                0,1,0, 1,1,-1, 1,1,0,

                0,0,-1, 0,1,0, 0,0,0,
                0,0,-1, 0,1,0, 0,1,-1,

                1,0,-1, 1,1,0, 1,0,0,
                1,0,-1, 1,1,0, 1,1,-1,

                0,0,-1, 1,1,-1, 1,0,-1,
                0,0,-1, 0,1,-1, 1,1,-1,

                0,0,0, 1,0,-1, 1,0,0,
                0,0,0, 0,0,-1, 1,0,-1
            ];
        }

        if(this.textureVerts === null) {
            this.textureVerts = [
                1,0, 0,1, 0,0,
                1,0, 1,1, 0,1,
        
                0,0, 1,1, 1,0,
                0,0, 1,1, 0,1,        
        
                1,0, 0,1, 0,0,
                1,0, 0,1, 1,1,    
        
                0,0, 1,1, 1,0,
                0,0, 1,1, 0,1,
                
                0,0, 1,1, 1,0,
                0,0, 0,1, 1,1,
        
                0,0, 1,1, 1,0,
                0,0, 0,1, 1,1
            ]
        }

        if(this.normalVerts == null)
        {
            this.normalVerts = [
                // Front Face (0,0,1)
                0,0,1, 0,0,1, 0,0,1,
                0,0,1, 0,0,1, 0,0,1,
            
                // Top Face (0,1,0)
                0,1,0, 0,1,0, 0,1,0,
                0,1,0, 0,1,0, 0,1,0,
            
                // Left Face (-1,0,0)
                -1,0,0, -1,0,0, -1,0,0,
                -1,0,0, -1,0,0, -1,0,0,
            
                // Right Face (1,0,0)
                1,0,0, 1,0,0, 1,0,0,
                1,0,0, 1,0,0, 1,0,0,
            
                // Back Face (0,0,-1)
                0,0,-1, 0,0,-1, 0,0,-1,
                0,0,-1, 0,0,-1, 0,0,-1,
            
                // Bottom Face (0,-1,0)
                0,-1,0, 0,-1,0, 0,-1,0,
                0,-1,0, 0,-1,0, 0,-1,0
            ];
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
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
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

        // Create a buffer object for normals
        if(this.normalBuffer === null) {
            this.normalBuffer = gl.createBuffer();
            if (!this.normalBuffer) {
                console.log('Failed to create the normalBuffer object');
                return -1;
            }
            
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalVerts), gl.DYNAMIC_DRAW);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Normal);
        }
    }
    
    render() {
        var rgba = this.color;
    
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        // Pass the fragment color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // Pass the Model Matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Compute the Normal Matrix (Inverse Transpose of Model Matrix)
        this.normalMatrix.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
    
        this.generateVertices();
        var n = 36; // Number of vertices
        this.setupBuffer();
        
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}