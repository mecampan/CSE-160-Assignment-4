function sin(x)
{
    return Math.sin(x);
}
function cos(x)
{
    return Math.cos(x);
}

class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.matrix = new Matrix4();

        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.normalBuffer = null;

        this.cubeVerts = null;
        this.textureVerts = null;
        this.normalVerts = null;

        this.textureNum = COLOR;
    }

    generateVertices() {
        if (this.cubeVerts !== null) return; // Avoid recomputing
    
        var d = Math.PI / 10;
        var dd = Math.PI / 10;
    
        this.cubeVerts = [];
        this.normalVerts = [];
        this.textureVerts = [];
    
        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < 2 * Math.PI; r += d) {
                var p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];
                var p2 = [sin(t + dd) * cos(r), sin(t + dd) * sin(r), cos(t + dd)];
                var p3 = [sin(t) * cos(r + d), sin(t) * sin(r + d), cos(t)];
                var p4 = [sin(t + dd) * cos(r + d), sin(t + dd) * sin(r + d), cos(t + dd)];
    
                // Store vertex positions
                this.cubeVerts.push(...p1, ...p2, ...p3);
                this.cubeVerts.push(...p3, ...p2, ...p4);
    
                // Store normals (same as position for a sphere)
                this.normalVerts.push(...p1, ...p2, ...p3);
                this.normalVerts.push(...p3, ...p2, ...p4);
    
                // Store texture coordinates (basic sphere mapping)
                this.textureVerts.push(0, 0, 1, 0, 0, 1);
                this.textureVerts.push(0, 1, 1, 0, 1, 1);
            }
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

        // Create a buffer object for UV
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
            gl.enableVertexAttribArray(a_Normal); //<---- This line here is what causes Vertex buffer is not big enough...
        }
    }

    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();
        
        var n = this.cubeVerts.length / 3; // Number of vertices
        
        this.setupBuffer();
        
        //return n;
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}